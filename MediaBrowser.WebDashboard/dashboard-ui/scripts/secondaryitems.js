define(["connectionManager","libraryMenu","loading","libraryBrowser","listView","cardBuilder","imageLoader","apphost","globalize","emby-itemscontainer"],function(connectionManager,libraryMenu,loading,libraryBrowser,listView,cardBuilder,imageLoader,appHost,globalize){"use strict";return function(view,params){function addCurrentItemToQuery(query,item){params.parentId&&(query.ParentId=params.parentId),"Person"==item.Type?query.PersonIds=item.Id:"Genre"==item.Type?query.GenreIds=item.Id:"MusicGenre"==item.Type?query.GenreIds=item.Id:"GameGenre"==item.Type?query.GenreIds=item.Id:"Studio"==item.Type?query.StudioIds=item.Id:"MusicArtist"==item.Type?query.ArtistIds=item.Id:query.ParentId=item.Id}function getQuery(parentItem){var key=getSavedQueryKey(),pageData=data[key];if(!pageData){pageData=data[key]={query:{SortBy:"SortName",SortOrder:"Ascending",Recursive:"false"!==params.recursive,Fields:"PrimaryImageAspectRatio,SortName,BasicSyncInfo",ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Banner,Thumb",StartIndex:0,Limit:libraryBrowser.getDefaultPageSize()}};var type=params.type;type&&(pageData.query.IncludeItemTypes=type,"Audio"==type&&(pageData.query.SortBy="Album,SortName"));var filters=params.filters;type&&(pageData.query.Filters=filters),parentItem&&addCurrentItemToQuery(pageData.query,parentItem),libraryBrowser.loadSavedQueryValues(key,pageData.query)}return pageData.query}function getSavedQueryKey(){return libraryBrowser.getSavedQueryKey()}function onViewStyleChange(parentItem){var query=getQuery(parentItem),itemsContainer=view.querySelector("#items");"Audio"==query.IncludeItemTypes?(itemsContainer.classList.add("vertical-list"),itemsContainer.classList.remove("vertical-wrap")):(itemsContainer.classList.remove("vertical-list"),itemsContainer.classList.add("vertical-wrap"))}function getPromise(parentItem){var query=getQuery(parentItem);return"nextup"===params.type?apiClient.getNextUpEpisodes({Limit:query.Limit,Fields:"PrimaryImageAspectRatio,SeriesInfo,DateCreated,BasicSyncInfo",UserId:apiClient.getCurrentUserId(),ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",EnableTotalRecordCount:!1}):apiClient.getItems(apiClient.getCurrentUserId(),query)}function reloadItems(parentItem){loading.show(),getPromise(parentItem).then(function(result){function onNextPageClick(){query.StartIndex+=query.Limit,reloadItems(view)}function onPreviousPageClick(){query.StartIndex-=query.Limit,reloadItems(view)}window.scrollTo(0,0);var i,length,elems,query=getQuery(parentItem),html="",pagingHtml=libraryBrowser.getQueryPagingHtml({startIndex:query.StartIndex,limit:query.Limit,totalRecordCount:result.TotalRecordCount,showLimit:!1});for(elems=view.querySelectorAll(".paging"),i=0,length=elems.length;i<length;i++)elems[i].innerHTML=pagingHtml;var itemsContainer=view.querySelector("#items"),supportsImageAnalysis=appHost.supports("imageanalysis");if(supportsImageAnalysis=!1,"Audio"==query.IncludeItemTypes)html=listView.getListViewHtml({items:result.Items,playFromHere:!0,action:"playallfromhere",smallIcon:!0});else{var posterOptions={items:result.Items,shape:"auto",centerText:!0,lazy:!0};"nextup"===params.type?posterOptions=Object.assign(posterOptions,{preferThumb:!0,shape:"backdrop",scalable:!0,showTitle:!0,showParentTitle:!0,overlayText:!1,centerText:!supportsImageAnalysis,overlayPlayButton:!0,cardLayout:supportsImageAnalysis,vibrant:supportsImageAnalysis}):"MusicAlbum"==query.IncludeItemTypes?(posterOptions.overlayText=!1,posterOptions.showParentTitle=!0,posterOptions.showTitle=!0,posterOptions.overlayPlayButton=!0):"MusicArtist"==query.IncludeItemTypes?(posterOptions.overlayText=!1,posterOptions.overlayPlayButton=!0,posterOptions.showTitle=!0):"Episode"==query.IncludeItemTypes?(posterOptions.overlayText=!1,posterOptions.showParentTitle=!0,posterOptions.showTitle=!0,posterOptions.overlayPlayButton=!0):"Series"==query.IncludeItemTypes?(posterOptions.overlayText=!1,posterOptions.showYear=!0,posterOptions.showTitle=!0,posterOptions.overlayMoreButton=!0):"Movie"==query.IncludeItemTypes&&(posterOptions.overlayText=!1,posterOptions.showYear=!0,posterOptions.showTitle=!0,posterOptions.overlayPlayButton=!0),html=cardBuilder.getCardsHtml(posterOptions)}for(itemsContainer.innerHTML=html,imageLoader.lazyChildren(itemsContainer),elems=view.querySelectorAll(".btnNextPage"),i=0,length=elems.length;i<length;i++)elems[i].addEventListener("click",onNextPageClick);for(elems=view.querySelectorAll(".btnPreviousPage"),i=0,length=elems.length;i<length;i++)elems[i].addEventListener("click",onPreviousPageClick);loading.hide()})}function getItemPromise(){var id=params.genreId||params.studioId||params.artistId||params.personId||params.parentId;if(id)return apiClient.getItem(Dashboard.getCurrentUserId(),id);var name=params.genre;return name?apiClient.getGenre(name,Dashboard.getCurrentUserId()):(name=params.musicgenre)?apiClient.getMusicGenre(name,Dashboard.getCurrentUserId()):(name=params.gamegenre,name?apiClient.getGameGenre(name,Dashboard.getCurrentUserId()):null)}var data={},apiClient=params.serverId?connectionManager.getApiClient(params.serverId):ApiClient;view.addEventListener("viewbeforeshow",function(e){var parentPromise=getItemPromise();parentPromise?parentPromise.then(function(parent){libraryMenu.setTitle(parent.Name),onViewStyleChange(parent),reloadItems(parent)}):("nextup"===params.type?libraryMenu.setTitle(globalize.translate("HeaderNextUp")):"Movie"===params.type&&"IsFavorite"===params.filters?libraryMenu.setTitle(globalize.translate("HeaderFavoriteMovies")):"Series"===params.type&&"IsFavorite"===params.filters?libraryMenu.setTitle(globalize.translate("HeaderFavoriteShows")):"Episode"===params.type&&"IsFavorite"===params.filters?libraryMenu.setTitle(globalize.translate("HeaderFavoriteEpisodes")):"MusicArtist"===params.type&&"IsFavorite"===params.filters?libraryMenu.setTitle(globalize.translate("HeaderFavoriteArtists")):"MusicAlbum"===params.type&&"IsFavorite"===params.filters?libraryMenu.setTitle(globalize.translate("HeaderFavoriteAlbums")):"Audio"===params.type&&"IsFavorite"===params.filters&&libraryMenu.setTitle(globalize.translate("HeaderFavoriteSongs")),onViewStyleChange(),reloadItems())})}});