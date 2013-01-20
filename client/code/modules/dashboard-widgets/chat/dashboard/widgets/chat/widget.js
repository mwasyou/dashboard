
(function(exports, ss, $, undefined) {

    //Private functions
    function _configure(container, id, conf) {
        this.id = id;
        this.container = container;
    }

    function _sendMessage(msgType, text, cb) {
        if (text && text.length > 0) {
            return ss.rpc('dashboard.widgets.chat.sendPublicMessage', {mty: msgType, msg: text}, cb);
        } else {
            return cb(false);
        }
    }

    function _updateChatlogTimes() {
        $('#'+this.id+' .time-calc time').each(function(i, e) {
            $(e).html('<i>'+moment.unix($(e).data('time')).fromNow()+'</i>');
        });
    }

    function _build() {
        var htmlBase = ss.tmpl['dashboard-widgets-chat-base'].render({id: this.id}), self, chatlog;
        self = this;
        this.container.html(htmlBase);

        chatlog = $('#'+this.id+' .chatlog');

        $('#'+this.id+' .msg-input').typeahead({
            source: ['#clear', '#error ', '#warning ', '#info ']
        });

        //Events

        setInterval(function() {_updateChatlogTimes.call(self);}, 10000);

        ss.event.on('chat:message:public', function(data) {
            if (typeof data !== "object" || !data.msg || !data.user || !data.mty) {
                return false;
            }
            var msgTime = new Date();
            var html = ss.tmpl['dashboard-widgets-chat-message'].render({
                username: data.user,
                message: data.msg,
                messagetype: data.mty,
                localdatetime: msgTime.toString(),
                datetime: msgTime.toISOString(),
                timestamp: Math.floor(Number(msgTime) / 1000),
            });

            $(html).hide().appendTo(chatlog).slideDown(100, function() {
                $('#'+self.id+' .chatlog-frame').scrollTop(chatlog.height());
            });
        });

        $('#'+this.id+' .chatform').on('submit', function() {
            var text = $('#'+self.id+' .msg-input').val();
            var msgType = 'std';
            if (text === '#clear') {
                $('#'+self.id+' .msg-input').val('');
                chatlog.empty();
                return;
            } else if (text.indexOf('#err') === 0) {
                msgType = 'error';
            } else if (text.indexOf('#war') === 0) {
                msgType = 'warning';
            } else if (text.indexOf('#inf') === 0) {
                msgType = 'info';
            }
            if (msgType !== 'std') {
                text = text.slice(text.indexOf(' ')+1);
            }
            return _sendMessage.call(self, msgType, text, function(success) {
                if (success) {
                    return $('#'+self.id+' .msg-input').val('');
                } else {
                    return ;
                }
            });
        });
    }

    //Constructor
    function WChat(container, id, conf) {
        _configure.call(this, container, id, conf || {});
        _build.call(this);
    }

    //Public functions
    WChat.prototype.setUsername = function(username) {
        this.username = username;
    };

    exports.factory = WChat;

}(typeof exports === 'undefined' ? window : exports, ss, jQuery));
