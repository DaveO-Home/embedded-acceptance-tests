/**
 * Controller to manage tablesorter
 */
import App from "../app.js";
import Base from "../utils/base.control.js";

module.exports = App.controllers["Table"] || (App.controllers["Table"] = new (Base.extend({
    defaults: {
    }
}, {
    tools: function (data) {
        var toolsUrl = "templates/stache/";

        this.view({
            data: data,
            templateUrl: toolsUrl,
            template: "tools.stache",
            list: true,
            loading: true,
            controller: data.controller
        });
    },
    decorateTable: function (elementId) {
        var id = "#" + elementId;
        var headers;
        var pageSorter = {
                    container: $(".ts-pager"),
                    cssGoto: ".pagenum",
                    removeRows: false,
                    output: "{startRow} - {endRow} / {filteredRows} ({totalRows})",
                    updateArrows: true,
                    page: 0,
                    size: 10
                };
        var defaultPage = [1, 10];

        if (elementId === "tools") {
            headers = { ".disabled": { sorter: false, filter: false } };
            defaultPage = [1, 20];
        }

        $(id).tablesorter({
            theme: "blue",
            widthFixed: true,
            headers: headers,
            headerTemplate: "{content} {icon}",
            widgets: ["filter", "columns", "resizeable", "zebra"],
            widgetOptions: {
                zebra: ["even", "odd"],
                columns: ["primary", "secondary", "tertiary"],
                filter_reset: ".reset"
            }
        }).tablesorterPager(pageSorter);

        $(id).trigger("pageAndSize", defaultPage);

    }
}))("#main_container"));
