if ($("#sajto-hirek").length > 0) {
  var sajto_data = {};
  var sajto_data_rows = 0;
  var sajto_page_size = 20;

  function sajto_page(page_active) {
    $("#sajto-hirek").empty();
    for(var i=(page_active-1)*sajto_page_size+2; i < (page_active)*sajto_page_size+2 && i<=sajto_data_rows; i++)
        $("#sajto-hirek").append('<li><strong>'+sajto_data[i]['B']+'</strong>: <a href="'+sajto_data[i]['E']+'" target="_blank">'+sajto_data[i]['D']+'</a></li>');

    $("#sajto-pages").empty();
    for(var i=1; i < sajto_data_rows/sajto_page_size+1; i++)
        $("#sajto-pages").append('<li' + (i==page_active ? ' class="active"':'') + '><a href="javascript:sajto_page(' + i + ');">' + i + '</a></li>');
  }

  $.getJSON("https://spreadsheets.google.com/feeds/cells/1PVopI292rFYQppL-LeMRec8RkAKuJBDBtWMxViIu5T0/od6/public/basic?alt=json").done(function (data) {
    data.feed.entry.forEach(function(e) {
        if (typeof(sajto_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))]) == 'undefined') {
          sajto_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))] = {};
          sajto_data_rows += 1;
        }
        sajto_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))][e.title.$t.replace(/[0-9]+/, '')] = e.content.$t;
    });

    sajto_page(1);
  });

}

if ($("#stream1").length > 0) {
  var stream_data = {};
  var stream_data_rows = 0;
  var stream_page_size = 4;
  var on_stream = [0, 0, 0, 0];
  var vid_k = 1000;
  var last_stream_status = '';
  var last_stream = '';
  var web_stream_status = '';
  var last_stream_status_change = 0.0;

  function stream_page(page_active) {
    var j=0;
    var new_on_stream = [];

    for(var i=2; i<=stream_data_rows; i++) {
        if(typeof(stream_data[i]['A']) != "undefined") sa = stream_data[i]['A']; else continue;
        new_on_stream.push(sa);
        j++;
        if(j >= stream_page_size) break;
    }

    if (on_stream[0] == new_on_stream[0] && on_stream[1] == new_on_stream[1] && on_stream[2] == new_on_stream[2] && on_stream[3] == new_on_stream[3])
        return;

    on_stream = new_on_stream;

    j = 0;
    s = "<ul id='stream1'>";
    for(var i=2; i<=stream_data_rows; i++) {
        if(typeof(stream_data[i]['A']) != "undefined") sa = stream_data[i]['A']; else continue;
        if(typeof(stream_data[i]['B']) != "undefined") sb = stream_data[i]['B']; else sb = '';
        if(typeof(stream_data[i]['C']) != "undefined") sc = stream_data[i]['C']; else sc = '';
        if(typeof(stream_data[i]['D']) != "undefined") sd = stream_data[i]['D']; else sd = '';
        if(typeof(stream_data[i]['E']) != "undefined") se = stream_data[i]['E']; else se = '';
        s += '<li><div class="streamhead"><div class="time pull-left">'+sb+'</div><div class="title">'+sc+'</div></div><div class="placc">'+sd+'</div><div class="desc">'+se+'</div></li>';
        j++;
        if(j >= stream_page_size) break;
    }
    s += '</ul><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';
    $("#stream1").replaceWith(s);
  }

  function set_video() {
    // decide
    //last_stream last_stream_status
    //web_stream_status
    if(last_stream_status == '') return; //wait for stream status

    if(last_stream != 'live') {
        new_stream_status = 'youtube';
    } else {
        var now = new Date().getTime();
        if(last_stream_status == 'live' && last_stream_status_change < now-20) {
            new_stream_status = 'live';
        }else if(last_stream_status != 'live' && last_stream_status_change < now-20){
            new_stream_status = 'youtube';
        }else{
            new_stream_status = last_stream_status;
        }
    }

    if(web_stream_status == new_stream_status) {return;}
    web_stream_status = new_stream_status;
    console.log('status change to '+ new_stream_status);
    if(new_stream_status == 'live') {
        $('#videostream').empty();
        $('#videostream').append('<iframe width="480" height="392" src="//www.ustream.tv/embed/18506424?v=3&amp;wmode=direct" scrolling="no" frameborder="0" style="border: 0px none transparent;"></iframe>');
    }else{
        $('#videostream').empty();
        $('#videostream').append('<iframe width="560" height="315" src="//www.youtube.com/embed/videoseries?list=PLpc7uPls78G_PRivR3l-wowsMbNPMfbFK" frameborder="0" allowfullscreen></iframe>');
    }
  }

  setInterval(function() {
    vid_k += 1;
    if (vid_k > 20) vid_k = 0; else return;
    $.getJSON("https://spreadsheets.google.com/feeds/cells/17kEAvFhsO2V9IArCfsjqfrHmyqw3ZRKcXL_egH8j6qY/od6/public/basic?alt=json").done(function (data) {
      stream_data = {};
      data.feed.entry.forEach(function(e) {
          if (typeof(stream_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))]) == 'undefined') {
            stream_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))] = {};
            stream_data_rows += 1;
          }
          stream_data[parseInt(e.title.$t.replace(/[A-Z]+/, ''))][e.title.$t.replace(/[0-9]+/, '')] = e.content.$t;
      });

      last_stream = stream_data[1]['F'];
      stream_page(1);
      set_video();
    });
    $.ajax({
        type: "GET", 
        dataType: "jsonp",
        url: "https://api.ustream.tv/json/channel/18506424/getValueOf/status",
        data: {},
        success: function(data) {
            if(last_stream_status != data) {
                last_stream_status_change = new Date().getTime();
            }
            last_stream_status = data;
            set_video();
        }
    });
  },500);

}
