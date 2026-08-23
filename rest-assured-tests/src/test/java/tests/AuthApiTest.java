package tests;

import base.BaseApiTest;
import clients.RestfulBookerClient;
import io.restassured.response.Response;
import models.AuthCredentials;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("Auth API - POST /auth and GET /ping")
class AuthApiTest extends BaseApiTest {

    private static RestfulBookerClient client;

    @BeforeAll
    static void initClient() {
        client = new RestfulBookerClient(spec);
    }

    @Test
    @DisplayName("Valid credentials return a non-empty token")
    void validCredentials_returnToken() {
        Response response = client.createToken(new AuthCredentials(ADMIN_USERNAME, ADMIN_PASSWORD));

        assertEquals(200, response.statusCode());
        String token = response.jsonPath().getString("token");
        assertThat(token, notNullValue());
        assertThat(token, not(equalTo("")));
    }

    @Test
    @DisplayName("Invalid credentials return a 'Bad credentials' reason")
    void invalidCredentials_returnReason() {
        Response response = client.createToken(new AuthCredentials("admin", "wrong-password"));

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getString("reason"), equalTo("Bad credentials"));
    }

    @Test
    @DisplayName("Health check GET /ping returns 201 Created")
    void healthCheck_returns201() {
        assertEquals(201, client.healthCheck().statusCode());
    }
}
