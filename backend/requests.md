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
    arguments: {
        name: string;
        description?: string;
        config?: Config;
        vkConfs?: number[];
    }
}

Config: {
    owner?: number,
    accessType?: string,
    length?: number
}
```
#### /queue/:id
- get - Возвращает очередь