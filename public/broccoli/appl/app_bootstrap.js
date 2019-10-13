module.exports = { html: "<span id=\"remove\" class=\"remove\">" +
    "<nav id=\"top-nav\" class=\"navbar-expand-md navbar-light fixed-top rounded nav-bar-bg\" hiddenX=\"hidden\">" +
        "<div class=\"nav-login\">" +
            "<small>" +"<a href=\"#\" class=\"login\"> Log in</a>" +"</small>" +
        "</div>" +
        "<div class=\"navbar navbar-toggler\" aria-controls=\"navbarTools\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">" +
            "<div class=\"container-fluid\">" +
                "<button class=\"navbar-toggler-right\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarTools\" >" +
                    "<span class=\"navbar-toggler-icon\">" +"</span>" +
                "</button>" +
                "<div class=\"collapse navbar-collapse\" id=\"navbarTools\">" +
                    "<ul class=\"navbar-nav mr-auto\">" +
                        "<li class=\"nav-item active\">" +
                            "<a class=\"nav-link\" href=\"#\"> Home" + "<span class=\"sr-only\"> (current)" +"</span>" +"</a>" +
                        "</li>" +
                        "<li class=\"nav-item dropdown\">" +
                            "<a class=\"nav-link dropdown-toggle\" href=\"\" id=\"tools01\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"> Tools" +"</a>" +
                            "<div class=\"dropdown-menu\" aria-labelledby=\"tools01\">" +
                                "<a class=\"dropdown-item\" href=\"#!pdf/test\">" +"PDF View</a>" +
                                "<a class=\"dropdown-item\" href=\"#!table/tools\">" +"Tabular View</a>" +
                            "</div>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
            "</div>" +
        "</div>" +    
        "<a class=\"pl-2 navbar-brand mr-auto\" href=\"#\">" +"Test</a>" +            
    "</nav>" +
    "<div class=\"container-fluid\">" +
        "<div id=\"side-nav\" class=\"row\" hiddenX=\"hidden\">" +
            "<nav class=\"col-md-2 bg-light rounded sidebar\" id=\"top-menu\">" +
                "<hr/>" +
                "<a>" +"<strong>" +"<i class=\"fa fa-eye\">" +"</i>" + "Views</strong>" +"</a>" +
                "<hr/>" +
                "<div class=\"nav flex-column nav-side-menu\">" +
                    "<ul class=\"nav navbar-collapse\">" +
                        "<li class=\"nav-header nav-item\">" +
                            "<a class=\"nav-link collapsed py-0 show\" href=\"#submenu1sub1\" " + 
                               "data-toggle=\"collapse\"" +
                               "data-target=\"#submenu1\"" +
                               "aria-expanded=\"true\"> Test Menu" +
                                "<i class=\"fa fa-chevron-down\">" +"</i>" +
                            "</a>" +
                            "<div class=\"collapse small show\" id=\"submenu1\" aria-expanded=\"true\">" +
                                "<ul class=\"flex-column nav pl-4\">" +
                                    "<li class=\"nav-item\">" +
                                        "<a class=\"nav-link p-0\" href=\"#!\">" +
                                            "<i class=\"fa fa-fw fa-home\">" +"</i> Home" +
                                        "</a>" +
                                    "</li>" +
                                    "<li class=\"nav-item\">" +
                                        "<a class=\"nav-link p-0\" href=\"#!pdf/test\">" +
                                            "<i class=\"fa fa-fw fa-file-pdf-o\">" +"</i> PDF View" +
                                        "</a>" +
                                    "</li>" +
                                    "<li class=\"nav-header nav-item\"> Statistics</li>" +
                                    "<li class=\"nav-item\">" +
                                        "<a class=\"nav-link p-0\" href=\"#!table/tools\">" +
                                            "<i class=\"fa fa-fw fa-table\">" +"</i> Tabular View" +
                                        "</a>" +
                                    "</li>" +
                                "</ul>" +
                            "</div>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
                "<hr />" +
            "</nav>" +
            "<main class=\"col-md-9 ml-md-auto col-md-10 pt-3\">" +
                "<div id=\"main_container\">" +
                    "<div class=\"loading-page\">" +"</div>" +
                "</div>" +
            "</main>" +
        "</div>" +"<!--/row-->" +
    "</div>" +"<!--/container-->" +
    "<hr>" +
    "<footer class=\"footer\">" +
        "<div class=\"container\">" +
            "<span class=\"ml-5 small text-muted\">" +"Karma, Jasmine, Brunch and CanJS Acceptance Test and Build Demo</span>" +
            "<span class=\"contact pull-right\" >" + 
                "<a href=\"#!contact\" >" +"<small class=\"grey\"> Contact</small></a>" +
            "</span>" + 
        "</div>" +
    "</footer>" +
"</span>"
};
