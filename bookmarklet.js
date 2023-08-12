javascript: (async function () {
  const URL_DATA_REGEX =
    /\/web\/index\.html\#!\/item\?id=(\d+)\&serverId=([0-9a-z]+)/;

  /*   const SOURCE_SELECTOR =
    "div[is='emby-scroller']:not(.hide) select.selectSource";
  const SUBTITLE_SELECTOR =
    "div[is='emby-scroller']:not(.hide) select.selectSubtitles";

  function getSubPath(mediaSource) {
    let selectSubtitles = document.querySelector(SUBTITLE_SELECTOR);
    let subTitlePath = "";
    if (selectSubtitles && selectSubtitles.value > 0) {
      let SubIndex = mediaSource.MediaStreams.findIndex(
        (m) => m.Index == selectSubtitles.value && m.IsExternal
      );
      if (SubIndex > -1) {
        let subtitleCodec = mediaSource.MediaStreams[SubIndex].Codec;
        subTitlePath = `/${mediaSource.Id}/Subtitles/${selectSubtitles.value}/Stream.${subtitleCodec}`;
      }
    } else {
      let chiSubIndex = mediaSource.MediaStreams.findIndex(
        (m) => m.Language == "chi" && m.IsExternal
      );
      if (chiSubIndex > -1) {
        let subtitleCodec = mediaSource.MediaStreams[chiSubIndex].Codec;
        subTitlePath = `/${mediaSource.Id}/Subtitles/${chiSubIndex}/Stream.${subtitleCodec}`;
      } else {
        let externalSubIndex = mediaSource.MediaStreams.findIndex(
          (m) => m.IsExternal
        );
        if (externalSubIndex > -1) {
          let subtitleCodec = mediaSource.MediaStreams[externalSubIndex].Codec;
          subTitlePath = `/${mediaSource.Id}/Subtitles/${externalSubIndex}/Stream.${subtitleCodec}`;
        }
      }
    }
    return subTitlePath;
  }

  function getSeek(position) {
    let ticks = position * 10000;
    let parts = [],
      hours = ticks / 36e9;
    (hours = Math.floor(hours)) && parts.push(hours);
    let minutes = (ticks -= 36e9 * hours) / 6e8;
    (ticks -= 6e8 * (minutes = Math.floor(minutes))),
      minutes < 10 && hours && (minutes = "0" + minutes),
      parts.push(minutes);
    let seconds = ticks / 1e7;
    return (
      (seconds = Math.floor(seconds)) < 10 && (seconds = "0" + seconds),
      parts.push(seconds),
      parts.join(":")
    );
  }

  async function getIntent(mediaSource, position) {
    let title = mediaSource.Path.split("/").pop();
    let externalSubs = mediaSource.MediaStreams.filter(
      (m) => m.IsExternal == true
    );
    let subs = "";
    let subs_name = "";
    let subs_filename = "";
    let subs_enable = "";
    if (externalSubs) {
      subs_name = externalSubs.map((s) => s.DisplayTitle);
      subs_filename = externalSubs.map((s) => s.Path.split("/").pop());
    }
    return {
      title: title,
      position: position,
      subs: subs,
      subs_name: subs_name,
      subs_filename: subs_filename,
      subs_enable: subs_enable,
    };
  } */

  async function getItemInfo(itemId) {
    let userId = ApiClient._serverInfo.UserId;
    let response = await ApiClient.getItem(userId, itemId);
    if (response.Type == "Series") {
      let seriesNextUpItems = await ApiClient.getNextUpEpisodes({
        SeriesId: itemId,
        UserId: userId,
      });
      console.log("nextUpItemId: " + seriesNextUpItems.Items[0].Id);
      return await ApiClient.getItem(userId, seriesNextUpItems.Items[0].Id);
    }
    if (response.Type == "Season") {
      let seasonItems = await ApiClient.getItems(userId, { parentId: itemId });
      console.log("seasonItemId: " + seasonItems.Items[0].Id);
      return await ApiClient.getItem(userId, seasonItems.Items[0].Id);
    }
    console.log("itemId:  " + itemId);
    return response;
  }

  async function getEmbyMediaInfo(itemId) {
    let itemInfo = await getItemInfo(itemId);
    let mediaSourceId = itemInfo.MediaSources[0].Id;
    let selectSource = document.querySelector(SOURCE_SELECTOR);
    if (selectSource && selectSource.value.length > 0) {
      mediaSourceId = selectSource.value;
    }
    let mediaSource = itemInfo.MediaSources.find((m) => m.Id == mediaSourceId);
    let streamURLPrefix = `${ApiClient._serverAddress}/emby/videos/${itemInfo.Id}`;
    /*     // subtitle
    let subPath = getSubPath(mediaSource);
    let subURL =
      subPath.length > 0
        ? `${streamURLPrefix}${subPath}?api_key=${ApiClient.accessToken()}`
        : "";
    // intent
    let position = parseInt(itemInfo.UserData.PlaybackPositionTicks / 10000);
    let intent = await getIntent(mediaSource, position);
    stream */
    let streamURL = `${streamURL}/stream.${
      mediaSource.Container
    }?api_key=${ApiClient.accessToken()}&Static=true&MediaSourceId=${mediaSourceId}`;

    console.log(streamURL, subURL, intent);

    return {
      streamURL,
      subURL,
      intent,
    };
  }

  let urlData = URL_DATA_REGEX.exec(window.location.href);

  if (urlData == null) {
    alert("Not a valid media page of a Emby website!");
  } else {
    try {
      let mediaInfo = await getEmbyMediaInfo(urlData[1]);
      navigator.clipboard.writeText(mediaInfo.streamURL).then(() => {
        alert("Copied to clipboard!");
      });
    } catch (e) {
      alert(`Something went wrong!\n${e}`);
    }
  }
})();
