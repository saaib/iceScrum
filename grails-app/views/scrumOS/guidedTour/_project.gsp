<g:set var="title" value="${message(code:'is.ui.guidedTour.project.title').encodeAsJavaScript()}"/>
<script type="text/javascript">
    (function ($) {
        var ${tourName} = new Tour({
            name: 'project',
            template: "${message(code:'is.ui.guidedTour.template').encodeAsJavaScript()}",
            steps: [
                {
                    element: "#window-title-bar-project",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.welcome').encodeAsJavaScript()}",
                    onShow: function() {
                        if (location.hash != '#project') {
                            return $.icescrum.openWindow('project');
                        }
                    }
                },
                {
                    element: "#menu-chart-navigation-item",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.chart').encodeAsJavaScript()}",
                    onShown: function() {
                        $("#menu-chart-navigation-item a").trigger('mouseenter');
                    },
                    onHide: function() {
                        $("#menu-chart-navigation-item a").trigger('mouseleave');
                    }
                },
                {
                    element: "#menu-documents-navigation-item",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.documents').encodeAsJavaScript()}",
                    onShown: function() {
                        $("#menu-documents-navigation-item a").trigger('mouseenter');
                    },
                    onHide: function() {
                        $("#menu-documents-navigation-item a").trigger('mouseleave');
                    }
                },
                {
                    element: "#menu-report-navigation-item",
                    title: "${title}",
                    placement: "bottom",
                    backdropPadding :50,
                    content: "${message(code:'is.ui.guidedTour.project.publishas').encodeAsJavaScript()}"
                },
                {
                    element: "#panel-chart-container",
                    title: "${title}",
                    content: "${message(code:'is.ui.guidedTour.project.projectindicators').encodeAsJavaScript()}"
                },
                {
                    element: "#panel-activity",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.activities').encodeAsJavaScript()}"
                },
                {
                    element: "#panel-description",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.description').encodeAsJavaScript()}"
                },
                {
                    element: ".panel-vision:first",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.description.releaseVision').encodeAsJavaScript()}"
                },
                {
                    element: ".panel-doneDefinition:first",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.description.current.definition').encodeAsJavaScript()}"
                },
                {
                    element: ".panel-retrospective:first",
                    title: "${title}",
                    placement: "left",
                    content: "${message(code:'is.ui.guidedTour.project.description.current.retrospective').encodeAsJavaScript()}",
                    onNext: function() {
                        return $.icescrum.openWindow('sandbox');
                    }
                }
            ]
        });
        <g:if test="${autoStart}">
        ${tourName}.restart();
        </g:if>
})(jQuery);
</script>