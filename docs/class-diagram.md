# UML Class Diagram

This diagram models the Bytez data layer (Mongoose schemas) and
the service classes that operate on it. The diagram is written
in Mermaid, so this Markdown file is also the editable source —
GitHub renders it automatically.

_Last updated: 2026-06-09_

## Data model

```mermaid
classDiagram
    class User {
      +ObjectId _id
      +String username
      +String hashedPassword
      +ObjectId[] favoriteRestaurants
      +RestaurantNote[] personalNotes
      +RestaurantMood[] moods
      +Date createdAt
      +Date updatedAt
    }

    class Restaurant {
      +ObjectId _id
      +String name
      +String address
      +String cuisine
      +Number price
      +Number rating
      +Number reviews
      +Number averagePriceSpent
      +String occasion
      +Date createdAt
      +Date updatedAt
    }

    class RestaurantNote {
      +ObjectId _id
      +ObjectId restaurant
      +String note
    }

    class RestaurantMood {
      +ObjectId _id
      +ObjectId restaurant
      +String mood
    }

    User "1" *-- "many" RestaurantNote : personalNotes
    User "1" *-- "many" RestaurantMood : moods
    User "many" --> "many" Restaurant : favoriteRestaurants
    RestaurantNote "many" --> "1" Restaurant : references
    RestaurantMood "many" --> "1" Restaurant : references
```

- `personalNotes` and `moods` are **embedded sub-documents** on
  the `User` (composition), each holding a reference to a
  `Restaurant`.
- `favoriteRestaurants` is an array of `Restaurant` references.

## Service layer

The services are the only modules that read or write the
database. Route handlers in `backend.js` delegate to them.

```mermaid
classDiagram
    class RestaurantService {
      +getRestaurants(search, cuisine, price, rating, reviews, avgPrice, occasion, sortBy)
      +addRestaurant(restaurant)
      +findRestaurantByID(id)
      +deleteRestaurantById(id)
    }

    class UserService {
      +createUser(user)
      +verifyUserPassword(username, password)
      +findUserById(id)
      +addFavoriteRestaurant(userId, restaurantId)
      +removeFavoriteRestaurant(userId, restaurantId)
      +addPersonalNote(userId, restaurantId, note)
      +updatePersonalNote(userId, noteId, note)
      +removePersonalNote(userId, noteId)
      +addMood(userId, restaurantId, mood)
      +removeMood(userId, moodId)
      +addUserRestaurantData(restaurants, userId, sortBy, moods, hasNotes)
      +getSavedRestaurants(userId)
    }

    class Auth {
      +generateAccessToken(user)
      +authenticateUser(req, res, next)
      +requireDeveloperUploadKey(req, res, next)
    }

    RestaurantService ..> Restaurant : uses
    UserService ..> User : uses
    UserService ..> Restaurant : reads
    Auth ..> User : encodes id/username in JWT
```

## Source

This file is the diagram source. To edit, modify the Mermaid
code blocks above; no external diagramming tool is required. The
diagrams can also be opened in the
[Mermaid Live Editor](https://mermaid.live) by pasting a code
block.
