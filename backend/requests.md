#### /
- get - Проверка подключения к серверу, ответ - пустой объект

#### /users
- get - Возвращает список пользователей
- post - Создание пользователя, возвращает Result
```TypeScript
body: {
    command: "create",
    arguments: {
        login: string, password: string
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
    owner?: number,
    accessType?: string,    //("public"/"private")
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

#### /queue/:id
- get - Возвращает очередь
- put - Взаимодействие человека с очередью
```TypeScript
body: {
    command: "join" | "leave" | "freeze" | "pop"
}
```