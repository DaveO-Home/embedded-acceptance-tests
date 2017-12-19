steal(function () {

    return function (Route, controller, action, id) {
        var addId = id? "/" + id: "";
        if (testit) {
            
            describe("Test Router: " + controller + "/" + action + addId, function () {
                
                it("controller set: " + controller, function () {
                        
                    expect(Route.data.controller).toBe(controller);

                });

                it("action set: " + action, function () {

                    expect(Route.data.action).toBe(action);
 
                });
                
                if(id) {
                    it("id set: " + id, function () {

                         expect(Route.data.id).toBe(id);

                    });
                }

                it("dispatch called: " + controller, function () {
                        
                    expect(Route.data.dispatch).toHaveBeenCalled();

                });
                
            });
        }
    };
});
