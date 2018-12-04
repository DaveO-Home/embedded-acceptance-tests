define(function () {
    return function (resource) {
        if (testit) {
            switch (resource) {
                case "index":
                    expect(document.querySelector("#main_container > div > h1").innerHTML).toBe("Welcome To");
                    break;
                case "pdf":
                    expect($("#main_container #pdfDO[src$='Test.pdf']").length > 0).toBe(true);
                    break;
                case "tools":
                    expect($("#main_container").find("select").first("jobtype-selector").find("option").length === 4).toBe(true);
                    break;
                default:
            }
        }
    };
});
