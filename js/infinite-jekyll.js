$(function() {

    var postURLs,
        isFetchingPosts = false,
        shouldFetchPosts = true,
        postsToLoad = $("section.main").length,
        loadNewPostsThreshold = 500,
        url = window.location.href,
        arrUrl = url.split('/'),
        serverUrl = arrUrl[0] + '//' + arrUrl[2];

    // Load the JSON file containing all URLs
    $.get(serverUrl + '/all-posts.json', function(data) {
        postURLs = data.posts;

        // If there aren't any more posts available to load than already visible, disable fetching
        if (postURLs.length <= postsToLoad)
            disableFetching();
    }, 'json');

    // If there's no spinner, it's not a page where posts should be fetched
    if ($("#infinite-spinner").length < 1)
        shouldFetchPosts = false;

    // Are we close to the end of the page? If we are, load more posts
    $(window).scroll(function(e){
        if (!shouldFetchPosts || isFetchingPosts) return;

        var windowHeight = $(window).height(),
            windowScrollPosition = $(window).scrollTop(),
            bottomScrollPosition = windowHeight + windowScrollPosition,
            documentHeight = $(document).height();

        // If we've scrolled past the loadNewPostsThreshold, fetch posts
        if ((documentHeight - loadNewPostsThreshold) < bottomScrollPosition) {
            fetchPosts();
        }
    });

    // Fetch a chunk of posts
    function fetchPosts() {
        // Exit if postURLs haven't been loaded
        if (!postURLs) return;

        isFetchingPosts = true;

        // Load as many posts as there were present on the page when it loaded
        // After successfully loading a post, load the next one
        var loadedPosts = 0,
            postCount = $("section.main").length,
            callback = function() {
                loadedPosts++;
                var postIndex = postCount + loadedPosts;

                if (postIndex > postURLs.length-1) {
                    disableFetching();
                    return;
                }

                if (loadedPosts < postsToLoad) {
                    fetchPostWithIndex(postIndex, callback);
                } else {
                    isFetchingPosts = false;
                }
            };

        fetchPostWithIndex(postCount + loadedPosts, callback);
    }

    function fetchPostWithIndex(index, callback) {
        var postURL = serverUrl + postURLs[index];

        $.get(postURL, function(data) {
            $(data).find(".preview").insertAfter("section.preview:last");
            callback();
        });
    }

    function disableFetching() {
        shouldFetchPosts = false;
        isFetchingPosts = false;
        $("#infinite-spinner").fadeOut();
    }

});