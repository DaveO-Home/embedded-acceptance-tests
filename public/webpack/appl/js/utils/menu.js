define(["lodash"], 
         function (_) {
            //MERGE STRING PLUGIN TO UNDERSCORE NAMESPACE

            return {
                //PASS IN AN HTML LIST ELEMENT
                activate: function (selector) {
                    var activated = false;
                    //ENSURE NAV PARAM IS A JQUERY OBJECT
                    var el = selector instanceof $ ? selector : $(selector);
                    //ACTIVATE NAV BUTTON
                    el.each(function () {
                        //GET LINK AND COMPARE AGAINST URL
                        var href = $("a", this).attr("href");
                        var url = href ? _.trimStart(href, "#!") : "none";
                        var hash = _.trimStart(window.location.hash, "#!");
                        //MATCHES ROUTES TO NAV LINKS
                        if (hash === url) {
                            window.location.hash = "";
                            //REMOVE ACTIVE CLASS FROM SIBLINGS
                            $(this).addClass("active").siblings().removeClass("active");
                            window.location.hash = "#!" + hash;
                            activated = true;
                            return false;
                        }
                    });

                    //REMOVE ACTIVE INDICATOR SINCE NOT ON A PAGE FROM THE NAV
                    if (!activated) {
                        el.removeClass("active");
                    }
                }
            };
        });
