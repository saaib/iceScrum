%{--
- Copyright (c) 2015 Kagilum.
-
- This file is part of iceScrum.
-
- iceScrum is free software: you can redistribute it and/or modify
- it under the terms of the GNU Affero General Public License as published by
- the Free Software Foundation, either version 3 of the License.
-
- iceScrum is distributed in the hope that it will be useful,
- but WITHOUT ANY WARRANTY; without even the implied warranty of
- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
- GNU General Public License for more details.
-
- You should have received a copy of the GNU Affero General Public License
- along with iceScrum.  If not, see <http://www.gnu.org/licenses/>.
-
- Authors:
-
- Vincent Barrier (vbarrier@kagilum.com)
- Nicolas Noullet (nnoullet@kagilum.com)
--}%

<script type="text/ng-template" id="story.light.html">
<div ng-style="(story.feature ? story.feature.color : '#f9f157') | createGradientBackground"
     class="sticky-note story {{ ((story.feature ? story.feature.color : '#f9f157') | contrastColor) + ' ' + (story.type | storyType) }}">
    <div>
        <div class="sticky-note-head">
            <span class="id">{{:: story.uid }}</span>
            <div class="sticky-note-type-icon"></div>
        </div>
        <div class="sticky-note-content" ng-class="{'has-description':!!story.description}">
            <div class="item-values">
                <span ng-if="story.state > 1"
                      ng-click="showEditEffortModal(story, $event)">
                    ${message(code: 'is.story.effort')} {{ story.effort != undefined ? story.effort : '?' }}
                </span>
                <span ng-if=":: story.state > 1 && story.value">|</span>
                <span ng-click="showEditValueModal(story, $event)"
                      ng-if="story.value">
                    ${message(code: 'is.story.value')} <strong>{{ story.value }}</strong>
                </span>
            </div>
            <div class="title"><a href="{{ link }}" style="color: #555555; text-decoration:none;" ng-if="link">{{ story.name }}</a></div>
            <div class="title" ng-if="!link">{{ story.name }}</div>
            <div class="description"
                 ng-bind-html="story.description | lineReturns | actorTag"></div>
        </div>
        <div class="sticky-note-tags">
            <a ng-repeat="tag in story.tags"
               href="{{ tagContextUrl(tag) }}">
                <span class="tag {{ getTagColor(tag, 'story') | contrastColor }}"
                      ng-style="{'background-color': getTagColor(tag, 'story') }">{{:: tag }}</span>
            </a>
        </div>
        <div class="sticky-note-actions">
            <span class="action" ng-class="{'active':story.attachments_count}">
                <a href="{{ link ? link : openStoryUrl(story.id) }}">
                    <i class="fa fa-paperclip" defer-tooltip="${message(code: 'todo.is.ui.backlogelement.attachments')}"></i>
                    <span class="badge">{{ story.attachments_count || '' }}</span>
                </a>
            </span>
            <span class="action" ng-class="{'active':story.comments_count}">
                <a href="{{ link ? link : openStoryUrl(story.id) }}/comments">
                    <i class="fa" ng-class="story.comments_count ? 'fa-comment' : 'fa-comment-o'" defer-tooltip="${message(code: 'todo.is.ui.comments')}"></i>
                    <span class="badge">{{ story.comments_count  || '' }}</span>
                </a>
            </span>
            <span class="action" ng-class="{'active':story.tasks_count}">
                <a href="{{ link ? link : openStoryUrl(story.id) }}/tasks">
                    <i class="fa fa-tasks" defer-tooltip="${message(code: 'todo.is.ui.tasks')}"></i>
                    <span class="badge">{{ story.tasks_count || '' }}</span>
                </a>
            </span>
            <span class="action" ng-class="{'active':story.acceptanceTests_count}">
                <a href="{{ link ? link : openStoryUrl(story.id) }}/tests">
                    <i class="fa" ng-class="story.acceptanceTests_count ? 'fa-check-square' : 'fa-check-square-o'" defer-tooltip="${message(code: 'todo.is.ui.acceptanceTests')}"></i>
                    <span class="badge">{{ story.acceptanceTests_count  || '' }}</span>
                </a>
            </span>
        </div>
        <div class="sticky-note-state-progress">
            <div ng-if="showStoryProgress(story)" class="progress">
                <span class="status">{{ story.countDoneTasks + '/' + story.tasks_count }}</span>
                <div class="progress-bar"
                     ng-style="{width: (story.countDoneTasks | percentProgress:story.tasks_count) + '%'}">
                </div>
            </div>
            <div class="state" ng-class="{'hover-progress':showStoryProgress(story)}">
                <!-- special case hide state if shifted and ghost story -->
                <span ng-if="!sprint || sprint.id == story.parentSprint.id">{{ story.state | i18n:'StoryStates' }}</span>
                <span ng-if="sprint && sprint.id != story.parentSprint.id">{{ message('todo.is.ui.story.shifted') }}</span>
            </div>
        </div>
    </div>
</div>
</script>