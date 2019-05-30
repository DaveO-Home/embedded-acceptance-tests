
describe("Unit Tests - doDex", function () {
    
    it("Remove a class from an element", function () {
        const cssClass = "class-to-remove";
        let element = {
            className: "class-left class-small class-to-remove"
        }
        const findClass = new RegExp(`(?:^|\\s)${cssClass}(?!\\S)`, "g");
        expect(element.className.includes("class-to-remove")).toBeTruthy();
        element.className = element.className.replace(findClass, "");
        expect(element.className.includes("class-to-remove")).toBeFalsy();
    });
});
