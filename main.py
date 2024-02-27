from flask import Flask, render_template, session, redirect, url_for, abort, request
from flask_socketio import SocketIO, leave_room, emit, join_room, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('connect')
def test_connect(auth):
    emit('server', 'Connected')


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('send_message')
def send_message(data):
    emit('message', {'author': session['username'], 'text': data['text']}, to=data['room'])


@socketio.on('join')
def on_join(room):
    join_room(room)
    emit('joined', session['username'], to=room)


@socketio.on('leave')
def on_leave(room):
    leave_room(room)
    emit('left', session['username'], to=room)


@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        username = request.get_json()['username']
        session['username'] = username
        return b'', 200
    abort(404)


@app.route('/profile')
def profile():
    if 'username' in session:
        return {'username': session['username']}
    else:
        abort(404)


@app.route('/chat/<chat_id>')
def chat(chat_id):
    return render_template("chat.html", chat_id=chat_id)


@app.route('/')
def index():
    return redirect(url_for('chat', chat_id='index'))


@app.route('/<path>')
def any_path(path):
    return redirect(url_for('chat', chat_id='index'))


if __name__ == '__main__':
    socketio.run(app, allow_unsafe_werkzeug=True)
