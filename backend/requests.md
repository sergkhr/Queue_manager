#### /
- get - Проверка подключения к серверу, ответ - пустой объект

#### /users
- get - Возвращает список пользователей
- post - Создание пользователя, возвращает Result
```TypeScript
body: {
    command: "create",
    arguments: {
        login: string, password: string, username: string
    }
}
```

#### /user/:login
- get - Возвращает объект пользователя

#### /login
- post - Авторизация, возвращает JWT токен, 
```TypeScript
body: {
    login: string, password: string
}
```

#### /queues
- get - Возвращает список очередей, потом прикручу фильтры
- post - Создание очереди, 
```TypeScript
body: {
    command: "create",
    arguments: {
        name: string;
        description?: string;
        config?: Config;
        vkConfs?: number[];
    }
}

Config: {
    owner?: {
        login: string,
        type: string
    },
    accessType?: "public" | "private"
    length?: number
}
```
- delete - Удаляет очередь
```TypeScript
body: {
    arguments: {
        id: id очереди
    }
}
```

#### /queue/:id     :id - это значение
- get - Возвращает очередь
- put - Взаимодействие человека с очередью
```TypeScript
body: {
    command: "join" | "leave" | "freeze" | "pop"
}
```
Также либо значение хедера "authorization" должно содержать jwt токен, либо в body должно быть поле login, если человек хочет войти/выйти/заморозится незалогинившись. Для попа можео без ничего

#### /queue/:id/subscribe
- get - Возвращает EventSource, чтобы подписаться на обновление очереди. 
Как с этим работать: https://learn.javascript.ru/server-sent-events?ysclid=libvtzr9w3251964410
```TypeScript
event: {
    op: "update" | "delete", // Обновление или удаление очереди
    update: // Если обновление, то тут будет находится описание того, что изменилось
}
```
