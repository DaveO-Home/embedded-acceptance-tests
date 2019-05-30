
describe("Unit Tests - Suite 2", function () {
    
    it("Is Karma active", function () {
        expect(window.__karma__).toBeTruthy();
    });
    
    it("Verify NaN", function () {
        expect((1 / "a").toString()).toBe((1 * "a").toString());
    });
});
