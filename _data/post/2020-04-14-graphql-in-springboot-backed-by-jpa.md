---
template: BlogPost
date: 2019-10-19T14:36:37.845Z
title: GraphQL in SpringBoot backed by JPA
thumbnail: /assets/screen-city-unsplash.jpg
tags:
  - Java
  - Spring Boot
  - GraphQL
source: https://gitlab.com/jameskolean/graphgql-demo/tree/master
---

The code is [here](https://gitlab.com/jameskolean/graphgql-demo/tree/master). Start with[ spring initializer](https://start.spring.io/) and add web, devtools, lombok, liquibase, and JPA support. Add in the dependencies for GraphQL and you end up with something like this.

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-spring-boot-starter</artifactId>
    <version>5.0.2</version>
  </dependency>
  <dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphql-java-tools</artifactId>
    <version>5.2.4</version>
  </dependency>
  <dependency>
    <groupId>com.graphql-java</groupId>
    <artifactId>graphiql-spring-boot-starter</artifactId>
    <version>5.0.2</version>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
    <exclusions>
      <exclusion>
        <groupId>org.junit.vintage</groupId>
        <artifactId>junit-vintage-engine</artifactId>
      </exclusion>
    </exclusions>
  </dependency>
</dependencies>
```

I use Liquibase to set up some sample data. You will need these application.properties/

```properties
spring.jpa.hibernate.naming.physical-strategy=com.example.demo.config.jpa.CustomPhysicalNamingStrategy
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

You will also need the files from src/main/resources/db. Go to the source repository mentioned above and copy over those files.

The JPA setup is standard stuff

### Book Entity

```java
@Data
@Entity
@Table(name = "BOOK")
public class Book {
    private String category;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String text;
    private String title;
    @Version
    private Long version;
}
```

### Book Repository

```java
@Repository
public interface BookRepository extends CrudRepository<Book, UUID>, PagingAndSortingRepository<Book, UUID> {
}
```

## GraphQL Stuff

Now all the boiler plate stuff is out of the way and we can get to GraphQL. Let’s start with the Schema definition at src/main/resources/bookstore.graphqls. Here we define one root query to get all the books and mutation method to perform the CRUD actions on a Book.

```json
# The Root Query for the application
type Query {
    books: [Book]
}

scalar UUID

type Book {
    id: UUID!
    title: String!
    text: String!
    category: String
}

# The Root Mutation for the application
type Mutation {
    addBook(title: String!, text: String!, category: String) : Book!,
    updateBook(id: UUID!,title: String, text: String, category: String) : Book!,
    removeBook(id: UUID!) : Boolean,
}
```

I complicated the example a bit using UUID for the id type but it’s what I will use in any real implementation so we may as well do it here. It does require us to write a GraphQLScalarType implementation that looks like this.

```java
@Component
public class UUIDScalarType extends GraphQLScalarType {

    UUIDScalarType() {
        super("UUID", "UUID value", new Coercing<UUID, String>() {

            @Override
            public UUID parseLiteral(final Object input) throws CoercingParseLiteralException {
                return UUID.fromString(((StringValue) input).getValue());
            }

            @Override
            public UUID parseValue(final Object input) throws CoercingParseValueException {
                return UUID.fromString(input.toString());
            }

            @Override
            public String serialize(final Object dataFetcherResult) throws CoercingSerializeException {
                return ((UUID) dataFetcherResult).toString();
            }
        });
    }
}
```

Now all we need to do is write the resolvers and mutators that we declared in the schema.

```java
@Component
public class Query implements GraphQLQueryResolver {
    @Autowired
    BookRepository bookRepository;

    public Iterable<Book> books() {
        return bookRepository.findAll();
    }
}
```

```java
@Component
public class Mutation implements GraphQLMutationResolver {

    @Autowired
    BookRepository bookRepository;

    public Book addBook(final String title, final String text, final String category) {
        final Book book = new Book();
        book.setTitle(title);
        book.setCategory(category);
        book.setText(text);
        return bookRepository.save(book);
    }

    protected boolean isBlank(final String target) {
        return target == null || target.isEmpty();
    }

    public Boolean removeBook(final UUID id) {
        bookRepository.deleteById(id);
        return true;
    }

    public Book updateBook(final UUID id, final String title, final String text, final String category) {
        final Optional<Book> optionalBook = bookRepository.findById(id);
        if (!optionalBook.isPresent()) {
            return null;
        }
        final Book book = optionalBook.get();
        if (!isBlank(title)) {
            book.setTitle(title);
        }
        if (!isBlank(category)) {
            book.setCategory(category);
        }
        if (!isBlank(text)) {
            book.setText(text);
        }
        return bookRepository.save(book);
    }
}
```

Now start up the app and go to the GraphiQL UI at <http://localhost:8080/graphiql>. Try these queries or go exploring.

Get all Books

```json
{
  books {
    id
    title
    text
    category
  }
}
```

Add a new book

```json
mutation {
  addBook(title: "My Best Seller", text: "https://nowhere.com/mybestseller", category: "fantasy") {
    title
    id
    text
    category
  }
}
```

Edit a book

```json
mutation {
  updateBook(id: "00000000-0000-0000-0000-000000000001", title:"test") {
    id
    title
    text
    category
  }
}
```

Delete a book

```json
mutation {
  removeBook(id: "00000000-0000-0000-0000-000000000001")
}
```
