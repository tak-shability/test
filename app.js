const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socket = require('socket.io');
const io = socket(http);
const port = 80;

app.use('/', (req, res) => {
    res.sendFile(__dirname + '/test.html');
});

let userList = [];

io.on('connection', (socket) => {
    console.log(`커넥션 이벤트 발생\n소켓 아이디: ${socket.id}`);

    socket.on('login', (user) => {
        if (!user) {
            io.emit('result', {
                code: 'login',
                data: false,
                detail: '존재하지 않는 아이디',
            });
        }
        if (typeof user !== 'object') user = JSON.parse(user);
        console.log(`로그인 이벤트 발생\n로그인 타입: ${user.type}\n아이디: ${user.name}\n소켓 아이디: ${socket.id}`);
        socket.join(user.type);
        userList.push({ userType: user.type, socketID: socket.id });
        console.log('userList', userList);
        io.to('admin').emit('join', {
            userType: user.type,
            message: `${user.name}님이 ${user.type} 방에 입장하셨습니다.`,
        });
        io.emit('result', {
            code: 'login',
            data: true,
        });
    });

    socket.on('insert', (data) => {
        console.log('data 제대로 들어옴!', data);
        if (!data) {
            io.emit('result', {
                code: 'insert',
                data: false,
                detail: '존재하지 않는 정보',
            });
        }
        if (typeof data !== 'object') data = JSON.parse(data);
        console.log(`스테이션 데이터 확인 이벤트 발생\n소켓 아이디: ${socket.id}\n태양광 정보: ${JSON.stringify(data.pv)}`);
        data.pcb.map((v) => Number(v.numb));
        data.pcb.sort((a, b) => a.numb - b.numb);
        function insertData() {
            let result = '';
            for (let i = 0; i < 3; i++) {
                result += `전력 정보 ${i + 1}번 포트: ${JSON.stringify(data.pcb[i])}\n`;
                console.log('result', result);
            }
            return result;
        }

        // insertData();

        // io.to(userList[0].socketID).emit('insertData', insertData());

        console.log('insertData', insertData());

        io.emit('result', {
            code: 'insert',
            data: true,
        });
    });
});

http.listen(port, () => {
    console.log('서버가 연결되었습니다.');
});
