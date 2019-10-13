module.exports = {
    domtest: function (resource) {

        if (typeof testit !== "undefined" && testit) {
            switch (resource) {

                case "index":
                    expect(document.querySelector("#main_container > div > h1").innerHTML).toBe("Welcome To");
                    break;
                case "pdf":
                    expect($("#main_container #pdfDO[src$='Test.pdf']").length > 0).toBe(true);
                    break;
                case "tools":
                    expect($("#main_container").find("select").first("jobtype-selector").find("option").length > 3).toBe(true);
                    break;
                default:
            }
        }
    }
};
