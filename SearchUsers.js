javascript:
/*
Bookmark name: /Search Users#

Setup:
1. Show your bookmarks toolbar. In Chrome, ... > Bookmarks > Show Bookmarks Bar. In Firefox, right-click in the title bar and click Bookmarks Toolbar.
2. Drag all this to the bookmark toolbar.

Or, copy this code to the browser console, or, if using Chrome, to a Snippet:
1. Press F12 (Windows) to open DevTools.
2. Go to Sources > Snippets, click New Snippet.
3. Give it a name, eg, "SearchUsers.js".
4. Copy/paste the code from https://gabrielsroka.github.io/SearchUsers.js
5. Save (Ctrl+S, Windows).

Usage:
1. Navigate your browser to your Okta admin console.
2. Press F12 (Windows) to open DevTools.
3. Run the code. Click the bookmarklet, or if using a Snippet, there's a Run button on the bottom right, or press Ctrl+Enter (Windows).
4. Look for the popup window in the upper-left corner of your browser.
*/
(async function () {
    const popup = createPopup('Search Users with Email Containing');
    const form = $('<form>Name <input class=search style="width: 250px"> <button type=submit>Search</button></form><br><div class=results>Loading...</div>').appendTo(popup);
    var users = [];
    for await (const page of getPages('/api/v1/users')) {
        users = users.concat(page);
        popup.find('div.results').html('Loading... ' + users.length + ' users.');
    }
    users.sort((u1, u2) => u1.profile.email.localeCompare(u2.profile.email));
    console.log('done');
    form.find('input.search').focus();
    form.submit(event => {
        event.preventDefault();
        const re = new RegExp(form.find('input.search').val(), 'i');
        const found = users
            .filter(user => re.test(user.profile.email))
            .map(user => `<tr><td>${user.profile.firstName} ${user.profile.lastName}<td>${user.profile.email.link('/admin/user/profile/view/' + user.id)}<td>${user.status}`)
            .join('');
        popup.find('div.results').html(found ? '<table class=data-list-table><tr><th>Name<th>Email<th>Status' + found + '</table>' : 'Not found');
    }).submit();

    async function* getPages(url) {
        while (url) {
            const r = await fetch(url);
            const page = await r.json();
            yield page;
            url = r.headers.get('link')?.match('<https://[^/]+(/[^>]+)>; rel="next"')?.[1];
        }
    }

    function createPopup(title) {
        const popup = $(`<div style='position: absolute; z-index: 1000; top: 0px; max-height: calc(100% - 28px); max-width: calc(100% - 28px); padding: 8px; margin: 4px; ` +
                `overflow: auto; background-color: white; border: 1px solid #ddd;'>` +
            `${title}<div style='display: block; float: right;'><a href='https://gabrielsroka.github.io/APIExplorer/' target='_blank' rel='noopener' style='padding: 4px'>?</a> ` + 
            `<a onclick='document.body.removeChild(this.parentNode.parentNode)' style='cursor: pointer; padding: 4px'>X</a></div><br><br></div>`).appendTo(document.body);
        return $('<div></div>').appendTo(popup);
    }
})();
