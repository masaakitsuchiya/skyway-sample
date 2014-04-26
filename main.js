var API_KEY = '6165842a-5c0d-11e3-b514-75d3313b9d05';

$(document).ready(function() {
    var peer = new Peer({key: API_KEY});
    var chatarea = $('#chatarea');
    var chatform = $('#chatform');
    var chatbox = $('#chatbox');
    var connections = [];

    console.log("Matching...");

    chatform.on('submit', function(e) {
        e.preventDefault();
        var data = {"peer": peer.id, "text": chatbox.val(), "draft": false};
        updateChatArea(data);
        sendToPeers(data);
        chatbox.val('');
    });

    chatform.on('click blur keydown keyup keypress change', function(e) {
        var data = {"peer": peer.id, "text": chatbox.val(), "draft": true};
        updateChatArea(data);
        sendToPeers(data);
    });

    peer.on('open', function(id) {
        var message = 'My peer ID is: ' + id;
        console.log(message);
        connectToPeers();
    });

    peer.on('connection', function(conn) {
        var message = "Connected from " + conn.peer;
        console.log(message);
        connections.push(conn);
        connections = connections.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        conn.on('data', function(data) {
            updateChatArea(data);
        });
    });

    function connectToPeers() {
        $.ajax({
            url: 'https://skyway.io/active/list/' + API_KEY,
            dataType: 'json',
            success: function(data) {
                _connectToPeers(data);
            },
            error: function(data) {
            },
            complate: function(data) {
            }
        });
    }

    function _connectToPeers(peers) {
        for (var i = 0;  i < peers.length; i++) {
            var id = peers[i];
            if (id == peer.id)
                continue;
            var conn = peer.connect(id, {serialization: 'json'});
            var message = "Connect to " + conn.peer;
            console.log(message);
            conn.on('data', function(data) {
                parseData(data);
            });
            connections.push(conn);
            connections = connections.filter(function (x, i, self) {
                return self.indexOf(x) === i;
            });
        }
    }

    function sendToPeers(data) {
        for (var i=0; i < connections.length; i++) {
            var conn = connections[i];
            var message = "Send '" + data + "' to " + conn.peer;
            console.log(message);
            conn.send(data);
        }
    }

    function updateChatArea(data) {
        if (data.text === undefined || data.peer === undefined) {
            return false;
        }
        var draft = $('span.' + data.peer + '.draft');
        if (data.text == '') {
            draft.parent().remove();
        }
        if (draft[0]) {
            draft.text(data.text);
            if (data.draft == false) {
                draft.removeClass('draft');
                $('.'+data.peer+'.draft-mark').remove();
                scrollToBottom();
            }
        } else {
            addNewMessage(data);
            scrollToBottom();
        }
        return true;
    }

    function addNewMessage(data) {
        chatarea.append(createMessageHtml(data));
    }

    function createMessageHtml(data) {
        var html = '<p><span ' + 'class="' + data.peer;
        if (data.draft) {
            html += " draft";
        }
        html += '">' + data.text + '</span>';
        html += "</p>";
        return html;
    }

    function scrollToBottom() {
        var p = $('#footer-point').offset().top;
        console.log(p);
        $('html,body').animate({scrollTop: p});
        return false;
    }
});
