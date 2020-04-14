---
template: BlogPost
date: 2019-09-19T14:53:04.213Z
title: GatsbyJS with Auth0 Springboot services
thumbnail: /assets/lock-unsplash.jpg
---
The GatsbyJS part could not be simpler. Let’s use Axios which is a pleasure to work with but we will also use hooks to make it a thing of beauty. You will need to reference [GatsbyJS Authentication with Auth0](https://rapidfifth.home.blog/2019/08/27/gatsbyjs-authentication-with-auth0/) for details on setting up authentication in a sample project. The source for this blog is [here](https://gitlab.com/jameskolean/gatsbyjs-auth0-springboot/tree/master).

The goal of the blog is to show how we can make a call to a third party service passing our JWT (JSON Web Token) and have that service validate the token responding with data specific to the logged in user. Let’s start in GatsbyJS with our call to the service. Edit nohingo/src/pages/student.js to include axios and axios-hooks. then edit the ‘courses’ component to add JWT and make the call.

```javascript
import axios from 'axios'
import useAxios from 'axios-hooks'
 
const Courses = ({ children }) => {
  axios.defaults.headers.common.Authorization = `Bearer ${getToken()}`
  const [{ data, loading, error }, refetch] = useAxios(
    'http://localhost:8080/v1/students'
  )
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error!</p>
  console.log()
  return (
    <div>
      <h2>Courses</h2>
      <button onClick={refetch}>refetch</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {children}
    </div>
  )
}
```

## Create the Service

To get started you will want to go to[ Spring Initializr](https://start.spring.io/) and include packages: Web, DevTools, Lombok. Now open the POM file and add these dependencies:

```xml
<dependency>
  <groupId>com.auth0</groupId>
  <artifactId>jwks-rsa</artifactId>
  <version>0.8.3</version>
</dependency>
<dependency>
  <groupId>com.auth0</groupId>
  <artifactId>java-jwt</artifactId>
  <version>3.8.2</version>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Now configure security.

```java
@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Value("${cors.allowed.origins}")
    private String[] allowedOrigins;
 
    @Autowired
    JwtTokenProvider jwtTokenProvider;
 
  @Override
  protected void configure(final HttpSecurity http) throws Exception {
    http.httpBasic().disable() //
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and() //
      .authorizeRequests() //
      .antMatchers(HttpMethod.OPTIONS, "/**").permitAll() //
      .anyRequest().authenticated().and() //
      .apply(new JwtSecurityConfigurer(jwtTokenProvider));
    http.cors(); // looks for bean CorsConfigurationSource
  }
 
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST"));
    configuration.setAllowCredentials(true);
    configuration.addAllowedHeader("Authorization");
    final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
```

Now write the classes to support JWT authentication.

```java
public class JwtSecurityConfigurer extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {
  private final JwtTokenProvider jwtTokenProvider;
  public JwtSecurityConfigurer(final JwtTokenProvider jwtTokenProvider) {
    this.jwtTokenProvider = jwtTokenProvider;
  }
 
  @Override
  public void configure(final HttpSecurity http) throws Exception {
    final JwtTokenAuthenticationFilter customFilter = new JwtTokenAuthenticationFilter(jwtTokenProvider);
    http.exceptionHandling().authenticationEntryPoint(new JwtAuthenticationEntryPoint()).and()
      .addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
  }
}
```

```java
@Component
@Slf4j
public class JwtTokenProvider {
 
  @Value("${jwt.issuer}")
  private String issuer;
 
  private Algorithm getAlgorythm(final DecodedJWT decodedJwt) throws JwkException, InvalidPublicKeyException {
    final JwkProvider jwkProvider = new JwkProviderBuilder(issuer).build();
    final Jwk jwk = jwkProvider.get(decodedJwt.getKeyId());
    final Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
    return algorithm;
  }
 
  public Authentication getAuthentication(final String token) {
    final Map<String, Claim> claims = JWT.decode(token).getClaims();
    final UserDetails userDetails = CustomUserDetails.builder() //
      .accountNonExpired(true)//
      .accountNonLocked(true)//
      .credentialsNonExpired(true)//
      .email(claims.get("email").asString())//
      .enabled(true)//
      .nickname(claims.get("nickname").asString())//
      .picture(claims.get("picture").asString())//
      .username(claims.get("name").asString())//
      .build();
 
    return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
  }
 
  public String getUsername(final String token) {
    return JWT.decode(token).getSubject();
  }
 
  public String resolveToken(final HttpServletRequest req) {
    final String bearerToken = req.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7, bearerToken.length());
    }
    return null;
  }
 
  public boolean validateToken(final String token) {
    try {
      final DecodedJWT decodedJwt = JWT.decode(token);
      final Verification verifier = JWT.require(getAlgorythm(decodedJwt));
      final DecodedJWT verify = verifier.build().verify(decodedJwt);
      if (verify.getClaim("exp").asDate().before(new Date())) {
        log.info("Expired JWT token.");
        return false;
      }
    } catch (final JwkException e) {
      throw new InvalidJwtAuthenticationException("Expired or invalid JWT token.", e);
    }
    return true;
  }
}
```

```java
public class JwtTokenAuthenticationFilter extends GenericFilterBean {
 
  private final JwtTokenProvider jwtTokenProvider;
 
  public JwtTokenAuthenticationFilter(final JwtTokenProvider jwtTokenProvider) {
    this.jwtTokenProvider = jwtTokenProvider;
  }
 
  @Override
  public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain filterChain)
    throws IOException, ServletException {
 
    final String token = jwtTokenProvider.resolveToken((HttpServletRequest) req);
    if (token != null && jwtTokenProvider.validateToken(token)) {
      final Authentication auth = jwtTokenProvider.getAuthentication(token);
 
      if (auth != null) {
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    }
    filterChain.doFilter(req, res);
  }
}

```

```java
public class InvalidJwtAuthenticationException extends AuthenticationException {
 
  private static final long serialVersionUID = 1L;
 
  public InvalidJwtAuthenticationException(final String e, final Throwable t) {
    super(e, t);
  }
}
```

```java
@ToString
@Builder
public class CustomUserDetails implements UserDetails {
 
  private static final long serialVersionUID = 1L;
 
  @Getter
  boolean accountNonExpired;
  @Getter
  boolean accountNonLocked;
  @Getter
  @Default
  Collection<? extends GrantedAuthority> authorities = new HashSet<>();
  @Getter
  private final boolean credentialsNonExpired;
  @Getter
  String email;
  @Getter
  private final boolean enabled;
  @Getter
  String nickname;
  @Getter
  String picture;
  @Getter
  String username;
 
  @Override
  public String getPassword() {
    return null;
  }
}
```

Now we just need to write the controller and use SecurityContextHolder to get the user requesting the service.

```java
@RestController
@RequestMapping("/v1/students")
public class StudentController {
 
  @GetMapping("")
  public ResponseEntity<String> all() {
    final CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
      .getPrincipal();
    return ok("hello " + userDetails.getNickname());
  }
}
```

### Extra

This project uses custom properties and meta-data to help the IDE intellisensing.

student-service/src/resources/application.properties

```properties
cors.allowed.origins=http://localhost:8000,http://localhost:9000
jwt.issuer=https://codegreenllc.auth0.com/
```

student-service/src/resources/METS-INF/additional-spring-configuration-metadata.json

```json
{
  "properties": [
    {
      "_comment": "don't use camelCase for the name",
      "name":"cors.allowed.origins",
      "type": "java.lang.String",
      "description": "CORS should allows these comma seperated list of origins. Eg: http://localhost:8000,http://some.where.com:80"
    },
    {
      "name":"jwt.issuer",
      "type": "java.lang.String",
      "description": "Issuer of the JWT"
    }
  ]
}

```
