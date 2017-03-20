$(document).ready(function() {
    injectHtml()
        .then(function() {
            $("#cc-badge").click(function() {
                $("#cc-chat-window").show();
                $("#cc-badge").hide();
                window.parent.postMessage("iframeMaximize", "*");
            });
            $("#cc-title-bar").click(function(event) {
                if ($(event.target).attr('id') != "cc-window-close" && $(event.target).attr('class') != "cc-title-close") {
                    $("#cc-badge").show();
                    $("#cc-chat-window").hide();
                    window.parent.postMessage("iframeMinimize", "*");
                }
            });
            $("#cc-window-close").click(function() {
                if ($('#cc-conversation-page').css('display') == "none") {
                    $("#cc-badge").show();
                    $("#cc-chat-window").hide();
                    window.parent.postMessage("iframeMinimize", "*");
                } else {
                    $("#cc-badge").show();
                    $("#cc-chat-window").hide();
                    $(".cc-conversation").empty();
                    $("#cc-userinfo-page").show();
                    $("#cc-conversation-page").hide();
                    window.parent.postMessage("iframeMinimize", "*");
                    resetConversation();
                }
            });
            $("#cc-username").on("change paste keyup", function() {
                $(".cc-validate-name").hide();
            });
            $("#cc-user-email").on("change paste keyup", function() {
                $(".cc-validate-email").hide();
            });
            $("#form-user").submit(function(event) {
                event.preventDefault();
                var flag = true;
                if (!validateEmail(this.email.value)) {
                    flag = false;
                    $(".cc-validate-email").show();
                }

                if (!validateName(this.name.value)) {
                    flag = false;
                    $(".cc-validate-name").show();
                }

                if (!navigator.onLine) {
                    $(".error-userinfo-page").fadeIn(400).delay(3000).fadeOut(400);
                    return;
                }

                if (flag) {
                    $("#cc-userinfo-page").hide();
                    $("#cc-conversation-page").show();
                    var name = this.name.value;
                    window.CCHAT_CONFIG.CONVERSATION_DATA.chatbot.name = this.name.value;
                    window.CCHAT_CONFIG.CONVERSATION_DATA.chatbot.email = this.email.value;
                    insertLoading();
                    removeLoading();
                    var msg = ["Hi I am here to help you."];
                    replyMsg(msg, true);
                    $(".cc-message").focus();
                    // getConversation()
                    //     .then(function(value) {
                    //         removeLoading();
                    //         var msg = value.output.text;
                    //         replyMsg(msg, true);
                    //         $(".cc-message").focus();
                    //     })
                    //     .catch(function(err) {
                    //         removeLoading();
                    //         var msg = ["Unable to connect server"];
                    //         replyMsg(msg, true);
                    //         $(".cc-message").focus();
                    //     });
                }
            });

            $('.cc-message').keydown(function(event) {
                if (event.keyCode == 13 && !event.shiftKey) {
                    $(this.form).submit()
                    return false;
                }
            });

            $("#cc-form-conversation").submit(function(event) {
                event.preventDefault();
                var msg = this.reply.value;
                msg = msg.trim();
                if (msg) {
                    var chatmsg = msg;
                    msg = msg.replace(/\r?\n/g, '<br />');
                    userChat(msg);
                    this.reply.value = "";
                    insertLoading();
                    getConversation(chatmsg)
                        .then(function(value) {
                            removeLoading();
                            var msg = value.output.text;
                            replyMsg(msg);
                            $(".cc-message").focus();
                        })
                        .catch(function(err) {
                            removeLoading();
                            $(".error").html(err);
                            $('.error').fadeIn(400).delay(3000).fadeOut(400);
                            $(".cc-message").focus();
                        });
                }
            }); 
        })
});

function getConversation(msg = "") {
    return new Promise(function(resolve, reject) {
        if (!navigator.onLine) {
            reject("Please check your internet connection");
            return;
        }
        var jsonData = window.CCHAT_CONFIG.CONVERSATION_DATA;
        jsonData.browserDetails = window.CCHAT_CONFIG.BROWSER_DETAILS;
        jsonData.browserDetails.pageURL = parent.window.location.href
        if (msg) {
            jsonData.input.text = msg,
            jsonData.input.date = new Date()
        }
        var url = window.CCHAT_CONFIG.API_URL + "conversation/"
        $.ajax({
            "method": "POST",
            "url": url,
            // The key needs to match your method's input parameter (case-sensitive).
            "headers": {
                "content-type": "application/json"
            },
            "data": JSON.stringify(jsonData),
            success: function(data) {
                if (data.status == "success") {
                    var value = data.data;
                    window.CCHAT_CONFIG.CONVERSATION_DATA.context = value.context;
                    resolve(value);
                } else {
                    var errMsg = "Something went wrong please try again";
                    reject(errMsg);
                }
            },
            error: function(errMsg) {
                reject("Something went wrong please try again");
            }
        });
    });
}

function getConfiguration() {
    window.CCHAT_CONFIG = {};
    return new Promise(function(resolve, reject) {
        window.parent.postMessage("sendConfig", "*");
        var checkConfig = setInterval(function() {
            if (window.CCHAT_CONFIG['HOST_URL']) {
                clearInterval(checkConfig)
                resolve();
            }
        }, 100);
    });
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateName(name) {
    name = name.trim();
    return /^[A-z ]+$/.test(name);
}

function getCurrentTime() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function userChat(msg) {
    $(".cc-quote-timestamp").remove();
    var html = '<div class="cc-quote-container visitor new-quote" title="' + new Date() + '" style="background-color: rgba(74, 74, 74, 0.298039); border-color: rgba(74, 74, 74, 0.298039);">';
    html += '<div>';
    html += '<div class="cc-username cc-left"></div>';
    html += '<span class="cc-quote-timestamp cc-right">' + getCurrentTime() + '</span>';
    html += '<div class="clearfix"></div>';
    html += '<div class="cc-quote me">';
    html += '<p>';
    html += '<span class="Linkify">' + msg + '</span>';
    html += ' </p>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    $(".cc-conversation").append(html)
        .animate({
            scrollTop: $('.cc-conversation').prop("scrollHeight")
        }, 500);
   checkLink();     
}

function replyMsg(msg, newmsg = false) {
    $(".cc-quote-timestamp").remove();
    var html = '<div style="padding: 0px 0px 0px 10px;font-size: 10px;color: #A9A9A9;clear: both;">Demo Bot</div>';
    for (var i = 0; i < msg.length; i++) {
        html += '<div class="cc-quote-container agent new-quote" title="' + new Date() + '">';
        html += '<div>';
        html += '<div class="cc-username cc-left"></div>';
        if (!newmsg) {
            html += '<span class="cc-quote-timestamp cc-right">' + getCurrentTime() + '</span>';
        }
        html += '<div class="clearfix"></div>';
        html += '<div class="cc-quote">';
        html += '<p>';
        html += '<span class="Linkify">' + msg[i] + '</span>';
        html += '</p>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    $(".cc-conversation").append(html)
        .animate({
            scrollTop: $('.cc-conversation').prop("scrollHeight")
        }, 500);
    checkLink();    
}

function insertLoading() {
    $(".cc-message").prop("readonly", true);
    var html = '<div id="ibm-loading" class="cc-quote-container" style="margin: 0 auto; width: 70px; clear: both;">';
    html += '<img id="cc-title-bar-icon" alt="" src="./images/ring.svg" style="width: 70px; height: 50px;">';
    html += '</div>';
    $(".cc-conversation").append(html)
        .animate({
            scrollTop: $('.cc-conversation').prop("scrollHeight")
        }, 500);
}

function removeLoading() {
    $('#ibm-loading').remove();
    $(".cc-message").prop("readonly", false);
}

function injectIframeCompactBadge() {
    var html = '<div>';
    html += '<div>';
    html += '<div id="cc-badge" class="mobile-badge-container  repaint">';
    html += '<div id="mobile-badge" class="mobile-badge ">';
    html += '<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">';
    html += '<g fill="none" fill-rule="evenodd">';
    html += '<circle fill="#FAFAFA" cx="25" cy="25" r="25"></circle>';
    html += '<path d="M36.8 24.733c0 5.33-5.123 9.646-11.433 9.646-1.5 0-2.923-.243-4.237-.685-1.832.973-3.463 1.637-5.647 2.054-.653.13-.912.117-.968.038-.065-.092.15-.273.34-.421 2.114-1.604 2.467-2.443 2.978-3.383-2.39-1.758-3.898-4.357-3.898-7.25 0-5.33 5.114-9.651 11.432-9.651 6.31 0 11.433 4.322 11.433 9.652z" stroke="#BDBDBD" fill="#D8D8D8" stroke-width="2"></path>';
    html += '</g>';
    html += '</svg>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<span></span>'
    html += '</div>';
    $("#cc-chat-badge").append(html);
}

function injectIframeFullBadge() {
    var config = window.CCHAT_CONFIG.CONFIG;
    var html = '<div>';
    html += '<div class="cc-default-minimized-view cc-page cc-badge clearfix cc-badge-bottom repaint" id="cc-badge" style="background-color: rgb(74, 74, 74);">';
    html += '<div id="cc-badge-icon" class="cc-badge-icon">';
    html += '<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">';
    html += '<g fill="none" fill-rule="evenodd">';
    html += '<circle fill="#FAFAFA" cx="25" cy="25" r="25"></circle>';
    html += '<path d="M36.8 24.733c0 5.33-5.123 9.646-11.433 9.646-1.5 0-2.923-.243-4.237-.685-1.832.973-3.463 1.637-5.647 2.054-.653.13-.912.117-.968.038-.065-.092.15-.273.34-.421 2.114-1.604 2.467-2.443 2.978-3.383-2.39-1.758-3.898-4.357-3.898-7.25 0-5.33 5.114-9.651 11.432-9.651 6.31 0 11.433 4.322 11.433 9.652z" stroke="#BDBDBD" fill="#D8D8D8" stroke-width="2"></path>';
    html += '</g>';
    html += '</svg>';
    html += '</div>';
    html += '<h2 class="cc-badge-title cc-truncate isOnDesktop" style="color: rgb(255, 255, 255);">' + config.text.badge + '</h2>';
    html += '</div>';
    html += '<span></span>'
    html += '</div>';
    $("#cc-chat-badge").append(html);
}

function mapText() {
    var config = window.CCHAT_CONFIG.CONFIG;
    $(".cc-title-text").html(config.text.titleBar);
    $(".cc-start-text").html(config.text.startButton);
    $(".cc-welcome-message").html(config.text.welcomeText);
    resetConversation();
    checkLink();
}

function injectHtml() {
    return new Promise(function(resolve, reject) {
        insertMessageEvent()
            .then(function() {
                getConfiguration()
                    .then(function() {
                        if (window.CCHAT_CONFIG.CONFIG.appearance.badgeStyle == "COMPACT") {
                            injectIframeCompactBadge();
                            resolve();
                        } else {
                            injectIframeFullBadge();
                            resolve();
                        }
                        mapText();
                    })
            })
            .catch(function(err) {
                console.log(err);
            });
    });
}

function resetConversation() {
    window.CCHAT_CONFIG.CONVERSATION_DATA = {
        "input": {},
        "context": {},
        "chatbot": {
            "name": "",
            "email": "",
            "pageUrl": ""
        },
        "browserDetails": {}
    }
}

function insertMessageEvent() {
    return new Promise(function(resolve, reject) {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

        // Listen to message from child window
        eventer(messageEvent, function(e) {
            var configData = JSON.parse(e.data);
            window.CCHAT_CONFIG = configData;
        }, false);
        /*postMessage second parameter represents the domain name to which this message can be sent to, if the child domain name doesn't match then this message will not be sent. Here * means any domain */
        resolve();
    });
}

function checkLink() {
    $('a').click(function(event) {
        event.preventDefault();
        var link = event.currentTarget.href;
        window.parent.postMessage(link, "*");
    });
}
