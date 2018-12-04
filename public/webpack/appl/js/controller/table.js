/**
 * Controller to manage tablesorter
 */

define(["app",
    "basecontrol"],
        function (App, Base) {
            return App.controllers.Table || (App.controllers.Table = new (Base.extend({
                defaults: {
                }
            }, {
                tools: function (data) {
                    var stache = require("templates/stache/tools.stache");
                    this.view({
                        data: data,
                        template: "tools.stache",
                        source: stache,
                        list: true,
                        loading: true,
                        controller: data.controller
                    });
                },
                decorateTable: function (elementId) {
                    var id = "#" + elementId,
                            headers,
                            pageSorter = {
                                container: $(".ts-pager"),
                                cssGoto: ".pagenum",
                                removeRows: false,
                                output: "{startRow} - {endRow} / {filteredRows} ({totalRows})",
                                updateArrows: true,
                                page: 0,
                                size: 10
                            },
                            defaultPage = [1, 10];

                    if (elementId === "tools") {
                        headers = {".disabled": {sorter: false, filter: false}};
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

        });
