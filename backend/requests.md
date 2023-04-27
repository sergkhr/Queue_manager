#### /users
- get - Возвращает список пользователей
- post - Создание пользователя, 
```TypeScript
body: {
    araguments: {
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
    araguments: {
        login: string, password: string
    }
}
```
#### /queues
- get - Возвращает список очередей, потом прикручу фильтры
- post - Создание очереди, 
```TypeScript
body: {
    araguments: {
        name: string;
        description?: string;
        config?: Config;
        vkConfs?: number[];
    }
}
```