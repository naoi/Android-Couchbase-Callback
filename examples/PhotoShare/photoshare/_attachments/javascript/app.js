DEFAULT_REPLICA_HOST = "http://localhost:5984/";
SHARE_DB_NAME = "photodemo-share-cloud";

var path = document.location.pathname.split('/')
    , dbname = path[1]
    , design = path[3]
    , users = { // in a real app users would have documents
        kid : {
            color : 'green',
            profile : 'high'	/* profile : 'low' */
        },
        mom : {
            color : 'blue',
            profile : 'high'
        },
        grandpa : {
            color : 'red',
            profile : 'high'	/* profile : 'low' */
        }
    }
    // select panel
    , who = 'myphotos'
    // initialize user
    , whoami = document.location.hash.substr(1) || 'kid'
    // user profile
    , profile = users[whoami]
    ;

$(function() {
    $('body').addClass('user_color_'+profile.color);
    
    //sets class for LG tablet
    detectScreenSize();
    
    //Initialized User specific changes
    initializeUser()
    
    document.addEventListener("deviceready", onDeviceReady, false);
    
    function detectScreenSize() {
		if (screen && screen.height<=768) {
			$("body").addClass("lg");
			// console.log('Adding class for the LG tablet');
		}
		else {
			// console.log('This tablet is 1028x800');
		}
		
    }


    function initializeUser(){
	console.log('method','initializeUser');
        //updates profile pic
        $('#user-profile-pic').removeClass('profile-pic-all').addClass('profile-pic-' + whoami);
    
        //sets the user color for "My Photos" button
       $('#myphotos').removeClass('friend-color-orange').addClass('friend-color-'+ profile.color);

        //adds [name of person] = "'s photos" to the btn
        $('#' + whoami + " .name-label" ).append("の写真");

        //Moves the Selected User's button below the "My Photos" button;
        $("#myphotos").after($('#' + whoami));

        //changes profile mode depending on the user
        if (profile.profile == 'high') {
            $("a.friend-button").hide();
            $("a.friend-button[href=#"+whoami+"]").show();
            // $("a.friend-button[href=#all]").show();
            $("a.friend-button[href=#myphotos]").show();
        }
	
	getTime();
    }
        
    
    function setupReset() {
	// console.log('method','setupReset');
        // resetting
        var resettable = false;
        $('.date-time-container').click(function() {
            resettable = true;
            $('#status-indicator').addClass('resettable');
            setTimeout(function() {
                resettable = false;
                $('#status-indicator').removeClass('resettable');
            }, 5000);
        });
        $('#status-indicator').click(function() {
            if (resettable) {
                coux([dbname, "_local/whoami"], function(err, doc) {
                    doc._deleted = true;
                    coux.put([dbname, "_local/whoami"], doc, function() {
                        coux([dbname, "_local/replica-host"], function(err, d2) {
                            d2._deleted = true;
                            coux.put([dbname, "_local/replica-host"], d2, function() {
                                window.location.reload();
                            });
                        });
                    });
                });
            }
        });
    }
    
    // get whoami
    coux([dbname, "_local/whoami"], function(err, doc) {
        if (!err) { // username has been chosen for this installation already
            if (whoami != doc.name) {
                // if it's not the same as the page launched as, fix it and refresh
                document.location.hash = doc.name;
                window.location.reload();
            } else {
                // we can assume replication is already running
                // but it doesn't hurt to trigger it again
                setupReset();
                triggerReplication(doc.name)
            }
            $('.dii-logo').click(function() {
                window.location.reload()
            });
            
        } else {
            activateUserChooser()
        }
    });
    
    // make whoami togglable but do not start replication until 
    // the user locks the username by clicking the docomo logo.
    // changing the user name after replication has been triggered 
    // could give undefined results.
    function activateUserChooser() {
        $('#user-profile-attachpoint').click(function() {
            var users = ["kid", "mom", "grandpa", 'kid']
                , idx = users.indexOf(whoami)
                ;
            document.location.hash = users[idx+1];
            
            window.location.reload();
        });

        $('.dii-logo').addClass('user-chooser')
        $('.dii-logo').click(function() {
            // save whoami
            coux.put([dbname, "_local/whoami"], {name : whoami}, function(err, ok) {
                window.location.reload();
            });
        });
    };
    

    
    /*
     * Set photo count
     */
    var newSharePhoto = false;
    var newSharePhotoConut = 0;
    var newFriendPhoto = false;
    var newFriendPhotoCount = 0;
    
    function howManyPhotos() {
	// console.log('method','howManyPhotos');
	howManyPhotosShare(newSharePhoto);
	howManyPhotosFriend(newFriendPhoto);
    };
     
    var charAddPhotoMark = ' ※ '  
    function howManyPhotosFriend( addPhoto ){
	coux([dbname, '_design', design, '_view','friend-photos',
        { group_level:1 ,  reduce : true }],
	     function(err, view) {
            var tot = 0;
            view.rows.forEach(function(r) {
		var addPhotoChar = '';
		if( true == addPhoto || newFriendPhotoCount != r.value ){
		    addPhotoChar = charAddPhotoMark;
		}
                 $("a.friend-button[href=#"+r.key[0]+"] .photo-count")
		    .text(r.value+' 枚の写真'+addPhotoChar);
		 newFriendPhotoCount = r.value;
            });
        });
    };
    
    function howManyPhotosShare( addPhoto ){
	coux([dbname, '_design', design, '_view','share-photos',
	{}], function(err, view) {
            var tot = 0;
            view.rows.forEach(function(r) {
		var addPhotoChar = '';
		if( true == addPhoto || newSharePhotoConut != r.value){
		    addPhotoChar = charAddPhotoMark;
		}
		 $("a.friend-button[href=#myphotos] .friend-name-container span")
		.text(r.value+' 枚の写真'+addPhotoChar);
		 newSharePhotoConut = r.value;
            });
        });
    }
    
    var thumbnailTemplate = $($("#thm-images-attachpoint ul.photo-template")[0]).clone();
    function renderThumbnails(rows) {
	console.log('method','renderThumbnails');
        var wrap = $('<div/>').hide();
        rows.map(function(r) {
            var thumb = thumbnailTemplate.clone();
            r.imgsrc = ['',dbname,r.id,'original.jpg'].join('/');
            thumb.css('display','block');
            thumb.find('li.photo').css('background-image',"url('"+r.imgsrc+"')");
            thumb.data('row',r);
            var color = users[r.value] && users[r.value].color;
            thumb.addClass('friend_color_'+color);
            thumb.appendTo(wrap);
            thumb.click(function() {
                var t = $(this)
                    , row = t.data('row');
                renderLargePhoto(row)
                $("#thm-images-attachpoint ul.photo-template").removeClass('selected');
                t.addClass('selected');
            });
        })
	wrap.prependTo("#thm-images-attachpoint").show();
	
	// get show photo count
	var classCount = $("#thm-images-attachpoint ul.photo-template").length;
	console.log('ul.photo-template',classCount);
	var panelWidth = 0;
	if ( classCount <= 7) {
	    panelWidth = 870;
	}else{
	    panelWidth = ( (classCount - 7) * 130 ) + 870;
	}
	document.getElementById("scroller").style.width= panelWidth + "px";
	document.getElementById("thm-images-attachpoint").style.width= panelWidth + "px";
	
	myScroll.refresh();
    }
    
    
    // setup replication
    function configReplication(fun) {
	// console.log('method','configReplication');
        coux([dbname, "_local/replica-host"], function(err, doc) {
            if (err) {
                var host = DEFAULT_REPLICA_HOST;
                host = prompt("Please configure the replica host", host);
                coux.put([dbname, "_local/replica-host"], {host : host}, function(err) {

                    window.location.reload();
                })
            } else {
                fun(doc.host)
            }
        });
    }
    
    function syncWithMyCloud(host) {
	// console.log('method','syncWithMyCloud');
        var pull = {
            source : host + 'photodemo-' + whoami + '-cloud'
            , target : dbname
            , continuous : true
        }, push = {
            target : host + 'photodemo-' + whoami + '-cloud'
            , source : dbname
            , continuous : true
        }
        coux.post(["_replicate"], pull, function() {});
        coux.post(["_replicate"], push, function() {});
    }
    
    // sync from all my low profile friend's backups automatically
    function pullMyLowFriends(host) {
	// console.log('method','pullMyLowFriends');
        var friend, pulls = []; 
        for (friend in users) {
	    if (users[friend].profile == "high") {
                pulls.push({
                    source : host + 'photodemo-' + friend + '-cloud'
                    , target : dbname
                    , continuous : true
                })
            }
        }
        pulls.forEach(function(rep) {
            // console.log('pull-low', rep.source)
            coux.post(["_replicate"], rep, function() {});
        });
    }
    
    function triggerReplication(name) {
	// console.log('method','triggerReplication');
        configReplication(function(host) {
            syncWithMyCloud(host);
            if (profile.profile == "high") {
                pullMyLowFriends(host);
            }
        });
    }
    // setup a changes listener
    var lastSeq = 0;
    setTimeout(function() {
	// console.log('method','setTimeout');
        coux.changes(dbname, function() {
	    queryThumbs();
            howManyPhotos();
        });        
    },10000);// 1000
    
    
    function switchWho(clicked) {
	// console.log('method','switchWho');
        who = clicked;
        $("#thm-images-attachpoint").empty();
        lastSeq = 0;
        $("a.friend-button").removeClass('selected');
        $("a.friend-button[href=#"+who+"]").addClass('selected');
	
	// delete star
	if( 'myphotos' == who ){
	    newSharePhoto = false;
	    howManyPhotosShare(newSharePhoto);
	}else{
	    newFriendPhoto = false;
	    howManyPhotosFriend(newFriendPhoto);
	}
        queryThumbs();
    };
    
    var notRenderShare = false;
    function queryThumbs() {
	// console.log('method','queryThumbs');
        if (who == 'myphotos') {
            queryThumbsAll()
        } else {
	    if( notRenderShare == false ){
		queryThumbsFriend(who)
	    }
	    notRenderShare = false;
        }
    };

    function queryThumbsFriend(friend) {
	// console.log('method','queryThumbsFriend');
        coux([dbname, '_design', design, '_view','friend-photos', 
        {update_seq : true, descending:true, reduce : false,
            startkey : [friend, {}],
            endkey : [friend, lastSeq],
            limit: 15}], queryThumbsCallback);
    };
    
    function queryThumbsAll() {
	// console.log('method','queryThumbsAll');
	coux([dbname, '_design', design, '_view','latest-photos',
        {update_seq : true, descending:true, reduce : false,
	    startkey : {},
	    endkey : lastSeq,
	    limit: 15}], queryThumbsCallback);
    }
    
    function queryThumbsCallback(err, view) {
	console.log('method','queryThumbsCallback');
        if (!err) {
            lastSeq = view.update_seq ? view.update_seq + 1 : lastSeq;
	    renderThumbnails(view.rows);
        }
    };
    
    var mainPhoto = false;
    $("#stage-panel ul.photo-template").click(function() {
	// console.log('method','stage-panel ul.photo-template.click');
	if (mainPhoto && profile.profile == 'high' && 'myphotos' != who) {
            $("body").addClass("overlay-mode")
        }
    });
    
    $("#overlay").click(function() {
	// console.log('method','overlay.click');
        $("body").removeClass("overlay-mode")
    });
    
    function renderLargePhoto(r) {
	// console.log('method','renderLargePhoto');
        var stage = $($("#stage-panel ul.photo-template")[0]);
        var rotationAngle = Math.floor(Math.random()*11) - 5;

        stage.find('li.photo').css({'background-image':"url('"+r.imgsrc+"')"});
        
        $('#stage-photo').css({'-webkit-transform':'rotate(' + rotationAngle + 'deg)'});
        
        mainPhoto = true;
        stage.data('row',r);
    }
    
    $("a#camera_button").click(function() {
        // console.log("this should take a photo");
        if (navigator.camera) {
            function success(imageData) {
		var createAt = new Date();
                var imageDoc = {
		  access : "private",
                  type: "photo",
                  author : whoami,
		  created_at: createAt,
                  _attachments: {
                    "original.jpg": {
                      content_type: "image/jpeg",
                      data: imageData
                    }
                }};
                coux.post([dbname], imageDoc, function(err, ok) {
                    console.log(err, ok);
		    // show photo share dialog
		    sharePhotoDialog(imageDoc,createAt);
                });
            };
            function fail(e) {
                // console.log(e)
            };
            navigator.camera.getPicture(success, fail, { quality: 20 });
        }
    })
    
    
    $("a.friend-button").click(function(e) {
	// console.log('method','.friend-button.click');
        e.preventDefault();
        var clicked = $(this).attr('href').substr(1);
	// overlay-mode sheck
        if ($('body').hasClass('overlay-mode')) {
            // console.log('share', clicked)
            // replicate the photo, turn off overlay
            shareWith(clicked)
        } else {
            // console.log('show', clicked)
            // select the who, set thumbnail list to them
            switchWho(clicked);
        }
    });
    
    /*
     * show photo share dialog
     */
    function sharePhotoDialog(imageDoc,createAt){
	yesNo = confirm("撮影した写真を共有しますか？");
	if( true == yesNo ){
	    // 共有写真として書き込み
	    var copyDate = new Date;
	    imageDoc.created_at = copyDate;
	    imageDoc.access = 'public';
	    coux.post([dbname], imageDoc, function(err, ok) {
		notRenderShare = true;
	        queryGetNewPhoto();
	    });
	}
    }
    
    function queryGetNewPhoto() {
	// console.log('method','queryGetNewPhoto');
	coux([dbname, '_design', design, '_view','latest-photos',
        {update_seq : true, descending:true, reduce : false,
	    startkey : {},
	    endkey : lastSeq,
	    limit: 1}], queryNewPhotoCallback);
    }
    
    function queryNewPhotoCallback(err, view) {
	console.log('method','queryNewPhotoCallback');
        if (!err) {
	    lastSeq = view.update_seq ? view.update_seq + 1 : lastSeq;
	    var docid = view.rows[0].id;
    	    doSharaWrapper(docid);
        }
    };
    
    function doSharaWrapper(docid){
	if( 'kid' == whoami ){
	    doShare('mom' , docid );
	    doShare('grandpa' , docid );
	}else if( 'mom' == whoami ){
	    doShare('kid' , docid );
	    doShare('grandp' , docid );
	}else if( 'grandpa' == whoami ){
	    doShare('kid' , docid );
	    doShare('mom' , docid );
	}
    }
    
    function shareWith(friend) {
	// console.log('method','shareWith');
	if (friend == 'myphotos') { // todo: turn this back on?
	    
	    // read select photo
	    var sel_photo = $($("#stage-panel ul.photo-template")[0]).data('row');
	    var bc = new Base64Converter();
	    var imageData = bc.convertImgDataURL( sel_photo.imgsrc );
		
	    var createAt = new Date();
	    var imageDoc = {
		access : "public",
		type: "photo",
		author : whoami,
		//created_at: new Date(),
		reated_at: createAt,
		_attachments: {
		    "original.jpg": {
			content_type: "image/jpeg",
			data: imageData
		    }
	        }
	    };
		
	    coux.post([dbname], imageDoc, function(err, ok) {
		//console.log('Select', 'Share-PhotoWrite-Result');
		//console.log(err, ok);
		queryGetNewPhoto(createAt);
	    });
        };
    }
    

    function doShare(friend, docid) {
            // get the current photo id
            var inbox = 'photodemo-'+friend+'-cloud'
            configReplication(function(host) {
                var replication = {
                    target : host + inbox
                    , source : dbname
                    , doc_ids : [docid]
                }
                coux.post(["_replicate"], replication, function() {});
		
                $('body').removeClass('overlay-mode')            
            });  
    }
    
    function getTime(){
	var d = new Date();
        h = d.getHours();
        m = d.getMinutes();
	if( m < 10 ){
	    m = '0' + m;
	}
        $("#date").text(d.toLocaleDateString());
        $("#time").text(h + ':' + m);
    }

    setInterval(function() {
	// console.log('method','setInterval');	
	getTime();
    }, 60000)
});



// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
//
function onDeviceReady() {
    
}

var Base64Converter = function(){

  this.loadBinaryResource = function(url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send(null);
    if (req.status != 200) return '';
    return req.responseText;
  }

  this.convertBinaryFile = function(url) {
    var filestream = this.loadBinaryResource(url);
    var bytes = [];
    for (i = 0; i < filestream.length; i++){
      bytes[i] = filestream.charCodeAt(i) & 0xff;
    }
    return String.fromCharCode.apply(String, bytes);
  }

  this.convertImgDataURL = function(url){
    var binary_file = this.convertBinaryFile(url);
    var base64 = btoa(binary_file);
    //var head = binary_file.substring(0,9);
    //var exe = this.checkExe(head);
    //console.log(head);
    //console.log(exe);
    //console.log(base64);
    return base64;
  }

  this.checkExe = function(head){
    if (head.match(/^\x89PNG/)) {
      return 'png';
    } else if (head.match(/^BM/)){
      return 'bmp';
    } else if (head.match(/^GIF87a/) || head.match(/^GIF89a/)) {
      return 'gif';
    } else if (head.match(/^\xff\xd8/)) {
      return 'jpeg';
    } else {
      return false;
    }
  }
}

