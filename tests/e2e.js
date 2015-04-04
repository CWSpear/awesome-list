describe('Protractor Demo App', function() {
    it('should have a title', function() {
        browser.get('http://localhost:8080');

        expect(browser.getTitle()).toEqual('Awesome Sort Demo');

        console.log(by.repeater('user in displayedUsers'));
        console.log(element(by.repeater('user in displayedUsers')));
        expect(element(by.repeater('user in displayedUsers')).length).toEqual(10);
    });
});
