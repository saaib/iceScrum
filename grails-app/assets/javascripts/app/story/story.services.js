/*
 * Copyright (c) 2014 Kagilum SAS.
 *
 * This file is part of iceScrum.
 *
 * iceScrum is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * iceScrum is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with iceScrum.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:
 *
 * Vincent Barrier (vbarrier@kagilum.com)
 * Nicolas Noullet (nnoullet@kagilum.com)
 *
 */
services.factory('Story', ['Resource', function($resource) {
    return $resource('story/:type/:typeId/:id/:action/:backlog');
}]);

services.service("StoryService", ['$q', '$http', 'Story', 'Session', 'FormService', 'StoryStatesByName', 'SprintStatesByName', 'IceScrumEventType', 'PushService', function($q, $http, Story, Session, FormService, StoryStatesByName, SprintStatesByName, IceScrumEventType, PushService) {
    this.list = [];
    this.isListResolved = $q.defer();
    var self = this;
    var crudMethods = {};
    crudMethods[IceScrumEventType.CREATE] = function(story) {
        var existingStory = _.find(self.list, {id: story.id});
        if (existingStory) {
            angular.extend(existingStory, story);
        } else {
            self.list.push(new Story(story));
        }
    };
    crudMethods[IceScrumEventType.UPDATE] = function(story) {
        angular.extend(_.find(self.list, {id: story.id}), story);
    };
    crudMethods[IceScrumEventType.DELETE] = function(story) {
        _.remove(self.list, {id: story.id});
    };
    _.each(crudMethods, function(crudMethod, eventType) {
        PushService.registerListener('story', eventType, crudMethod);
    });
    this.mergeStories = function(stories) {
        angular.forEach(stories, function(story) {
            crudMethods[IceScrumEventType.CREATE](story);
        });
        self.isListResolved.resolve(true);
    };
    this.save = function(story) {
        story.class = 'story';
        return Story.save(story, crudMethods[IceScrumEventType.CREATE]).$promise;
    };
    this.listByType = function(obj) {
        var alreadyLoadedStories = [];
        var mustLoad = false;
        var promise;
        angular.forEach(obj.stories_ids, function(story) {
            var alreadyLoadedStory = _.find(self.list, {id: story.id});
            if (!_.isEmpty(alreadyLoadedStory)) {
                alreadyLoadedStories.push(alreadyLoadedStory);
            } else {
                mustLoad = true;
            }
        });
        if (alreadyLoadedStories.length > 0) {
            obj.stories = alreadyLoadedStories;
        }
        if (mustLoad) {
            promise = Story.query({typeId: obj.id, type: obj.class.toLowerCase()}, function(data) {
                if (obj.stories === undefined) {
                    obj.stories = [];
                }
                angular.forEach(data, function(story) {
                    if (_.isEmpty(self.list)) {
                        self.isListResolved.resolve(true);
                    }
                    if (_.chain(obj.stories).where({id: story.id}).isEmpty().value()) {
                        var newStory = new Story(story);
                        obj.stories.push(newStory);
                        self.list.push(newStory);
                    }
                });
            }).$promise;
        } else {
            if (obj.stories === undefined) {
                obj.stories = [];
            }
        }
        return promise ? promise : $q.when(obj.stories);
    };
    this.get = function(id) {
        return self.isListResolved.promise.then(function() {
            var story = _.find(self.list, function(rw) {
                return rw.id == id;
            });
            if (story) {
                return story;
            } else {
                throw Error('todo.is.ui.story.does.not.exist');
            }
        });
    };
    this.update = function(story) {
        return Story.update(story, crudMethods[IceScrumEventType.UPDATE]).$promise;
    };
    this['delete'] = function(story) {
        return story.$delete(crudMethods[IceScrumEventType.DELETE]);
    };
    this.accept = function(story) {
        story.state = StoryStatesByName.ACCEPTED;
        return this.update(story);
    };
    this.returnToSandbox = function(story) {
        story.state = StoryStatesByName.SUGGESTED;
        return this.update(story);
    };
    this.unPlan = function(story) {
        story.parentSprint = {};
        return this.update(story);
    };
    this.shiftToNext = function(story) {
        return Story.update({shiftToNext: true}, story, crudMethods[IceScrumEventType.UPDATE]).$promise;
    };
    this.done = function(story) {
        return Story.update({id: story.id, action: 'done'}, {}, crudMethods[IceScrumEventType.UPDATE]).$promise;
    };
    this.unDone = function(story) {
        return Story.update({id: story.id, action: 'unDone'}, {}, crudMethods[IceScrumEventType.UPDATE]).$promise;
    };
    this.like = function(story) {
        return Story.update({id: story.id, action: 'like'}, {}, function(resultStory) {
            story.liked = resultStory.liked;
            story.likers_count = resultStory.likers_count;
        }).$promise;
    };
    this.follow = function(story) {
        return Story.update({id: story.id, action: 'follow'}, {}, function(resultStory) {
            story.followed = resultStory.followed;
            story.followers_count = resultStory.followers_count;
        }).$promise;
    };
    this.updateRank = function(story, newRank, relatedStories) {
        story.rank = newRank;
        return self.update(story).then(function(story) {
            angular.forEach(relatedStories, function(relatedStory, index) {
                // Update the reference stories rather than stories from sortable updated model to ensure propagation and prevent erasure
                var referenceStory = _.find(self.list, { id: relatedStory.id });
                var currentRank = index + 1;
                if (referenceStory.rank != currentRank) {
                    referenceStory.rank = currentRank;
                }
            });
            return story;
        });
    };
    this.plan = function(story, sprint, rank) {
        story.rank = rank;
        story.parentSprint = { id: sprint.id };
        return self.update(story).then(function(story) {
            return story;
        });
    };
    this.activities = function(story, all) {
        var params = {action: 'activities', id: story.id};
        if (all) {
            params.all = true;
        }
        return Story.query(params, function(activities) {
            story.activities = activities;
        }).$promise;
    };
    this.acceptAs = function(story, target) {
        return Story.update({id: story.id, action: 'acceptAs' + target}, {}, function() {
            _.remove(self.list, {id: story.id});
        }).$promise;
    };
    this.copy = function(story) {
        return Story.update({id: story.id, action: 'copy'}, {}, function(story) {
            self.list.push(story);
        }).$promise;
    };
    this.getMultiple = function(ids) {
        return self.isListResolved.promise.then(function() {
            return _.filter(self.list, function(story) {
                return _.contains(ids, story.id.toString());
            });
        });
    };
    this.updateMultiple = function(ids, updatedFields) {
        return Story.updateArray({id: ids}, {story: updatedFields}, function(stories) {
            angular.forEach(stories, function(story) {
                var index = self.list.indexOf(_.find(self.list, {id: story.id}));
                if (index != -1) {
                    self.list.splice(index, 1, story);
                }
            });
        }).$promise;
    };
    this.deleteMultiple = function(ids) {
        return Story.delete({id: ids}, function() {
            _.remove(self.list, function(story) {
                return _.contains(ids, story.id.toString());
            });
        }).$promise;
    };
    this.copyMultiple = function(ids) {
        return Story.updateArray({id: ids, action: 'copy'}, {}, function(stories) {
            angular.forEach(stories, function(story) {
                self.list.push(new Story(story));
            });
        }).$promise;
    };
    this.acceptMultiple = function(ids) {
        var fields = {state: StoryStatesByName.ACCEPTED};
        return this.updateMultiple(ids, fields);
    };
    this.acceptAsMultiple = function(ids, target) {
        return Story.updateArray({id: ids, action: 'acceptAs' + target}, {}, function() {
            _.remove(self.list, function(story) {
                return _.contains(ids, story.id.toString());
            });
        }).$promise;
    };
    this.followMultiple = function(ids, follow) {
        return Story.updateArray({id: ids, action: 'follow'}, {follow: follow}, function(stories) {
            angular.forEach(stories, function(story) {
                var index = self.list.indexOf(_.find(self.list, {id: story.id}));
                if (index != -1) {
                    self.list.splice(index, 1, story);
                }
            });
        }).$promise;
    };
    this.listByBacklog = function(backlog) {
        return Story.query({action: 'listByBacklog', backlog: backlog.id}).$promise.then(function(stories) {
            self.mergeStories(stories);
            return stories;
        });
    };
    this.authorizedStory = function(action, story) {
        switch (action) {
            case 'copy':
            case 'create':
            case 'follow':
                return Session.authenticated();
            case 'createTemplate':
                return Session.inProduct();
            case 'upload':
            case 'update':
                return (Session.po() && story.state >= StoryStatesByName.SUGGESTED && story.state < StoryStatesByName.DONE) ||
                    (Session.creator(story) && story.state == StoryStatesByName.SUGGESTED);
            case 'updateEstimate':
                return Session.tmOrSm() && story.state > StoryStatesByName.SUGGESTED && story.state < StoryStatesByName.DONE;
            case 'updateParentSprint':
                return Session.poOrSm() && story.state > StoryStatesByName.ACCEPTED && story.state < StoryStatesByName.DONE;
            case 'accept':
                return Session.po() && story.state == StoryStatesByName.SUGGESTED;
            case 'updateTemplate':
            case 'rank':
                return Session.po() && (!story || story.state < StoryStatesByName.DONE);
            case 'delete':
                return (Session.po() && story.state < StoryStatesByName.PLANNED) ||
                    (Session.creator(story) && story.state == StoryStatesByName.SUGGESTED);
            case 'returnToSandbox':
                return Session.po() && _.contains([StoryStatesByName.ACCEPTED, StoryStatesByName.ESTIMATED], story.state);
            case 'unPlan':
                return Session.poOrSm() && story.state >= StoryStatesByName.PLANNED && story.state < StoryStatesByName.DONE;
            case 'shiftToNext':
                return Session.poOrSm() && story.state >= StoryStatesByName.PLANNED && story.state <= StoryStatesByName.IN_PROGRESS;
            case 'done':
                return Session.po() && story.state == StoryStatesByName.IN_PROGRESS;
            case 'unDone':
                return Session.po() && story.state == StoryStatesByName.DONE && story.parentSprint.state == SprintStatesByName.IN_PROGRESS;
            default:
                return false;
        }
    };
    this.authorizedStories = function(action, stories) {
        var self = this;
        switch (action) {
            case 'copy':
                return Session.po();
            default:
                return _.every(stories, function(story) {
                    return self.authorizedStory(action, story);
                });
        }
    };
    // Templates
    var cachedTemplateEntries;
    this.getTemplateEntries = function() {
        var deferred = $q.defer();
        if (angular.isArray(cachedTemplateEntries)) {
            deferred.resolve(cachedTemplateEntries);
        } else {
            FormService.httpGet('story/templateEntries').then(function(templateEntries) {
                cachedTemplateEntries = templateEntries;
                deferred.resolve(templateEntries);
            });
        }
        return deferred.promise;
    };
    this.saveTemplate = function(story, name) {
        return Story.update({id: story.id, action: 'saveTemplate', 'template.name': name}, {}).$promise.then(function(templateEntry) {
            if (angular.isArray(cachedTemplateEntries)) {
                cachedTemplateEntries.push(templateEntry);
            }
        });
    };
    this.deleteTemplate = function(templateId) {
        return $http.post('story/deleteTemplate?template.id=' + templateId).success(function() {
            _.remove(cachedTemplateEntries, {id: templateId});
        });
    };
    this.listByField = function(field) {
        return Story.get({action: 'listByField', field: field}).$promise
    };
    this.getDependenceEntries = function(story) {
        return FormService.httpGet('story/' + story.id + '/dependenceEntries');
    };
    this.getParentSprintEntries = function() {
        return FormService.httpGet('story/sprintEntries');
    };
    this.getTemplatePreview = function(templateId) {
        return FormService.httpGet('story/templatePreview', {params: {template: templateId}});
    };
    this.findDuplicates = function(term) {
        return FormService.httpGet('story/findDuplicates', {params: {term: term}});
    }
}]);
