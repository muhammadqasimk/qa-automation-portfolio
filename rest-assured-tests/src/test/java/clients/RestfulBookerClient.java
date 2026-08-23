package clients;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import models.AuthCredentials;
import models.Booking;

import java.util.function.Supplier;

import static io.restassured.RestAssured.given;

/**
 * Thin client over the Restful-Booker endpoints. Every method returns the raw
 * {@link Response} so tests own their assertions.
 *
 * <p>The shared demo rate-limits bursts with HTTP 418; each request is retried
 * transparently with a fixed backoff so the suite stays deterministic.
 */
public class RestfulBookerClient {

    private static final int RATE_LIMIT_STATUS = 418;
    private static final int MAX_RETRIES = 5;
    private static final long BACKOFF_MILLIS = 1500;

    private final RequestSpecification spec;

    public RestfulBookerClient(RequestSpecification spec) {
        this.spec = spec;
    }

    public Response createToken(AuthCredentials credentials) {
        return execute(() -> given().spec(spec).body(credentials).when().post("/auth"));
    }

    public String getToken(AuthCredentials credentials) {
        return createToken(credentials).jsonPath().getString("token");
    }

    public Response healthCheck() {
        return execute(() -> given().spec(spec).when().get("/ping"));
    }

    public Response createBooking(Booking booking) {
        return execute(() -> given().spec(spec).body(booking).when().post("/booking"));
    }

    public Response createBookingRaw(String jsonBody) {
        return execute(() -> given().spec(spec).body(jsonBody).when().post("/booking"));
    }

    public Response getBooking(int id) {
        return execute(() -> given().spec(spec).when().get("/booking/{id}", id));
    }

    public Response getAllBookingIds() {
        return execute(() -> given().spec(spec).when().get("/booking"));
    }

    public Response getBookingIdsByName(String firstname, String lastname) {
        return execute(() -> given().spec(spec)
                .queryParam("firstname", firstname)
                .queryParam("lastname", lastname)
                .when().get("/booking"));
    }

    public Response updateBooking(int id, Booking booking, String token) {
        return execute(() -> given().spec(spec).cookie("token", token).body(booking)
                .when().put("/booking/{id}", id));
    }

    public Response updateBookingWithoutAuth(int id, Booking booking) {
        return execute(() -> given().spec(spec).body(booking).when().put("/booking/{id}", id));
    }

    public Response partialUpdate(int id, String jsonBody, String token) {
        return execute(() -> given().spec(spec).cookie("token", token).body(jsonBody)
                .when().patch("/booking/{id}", id));
    }

    public Response deleteBooking(int id, String token) {
        return execute(() -> given().spec(spec).cookie("token", token).when().delete("/booking/{id}", id));
    }

    public Response deleteBookingWithoutAuth(int id) {
        return execute(() -> given().spec(spec).when().delete("/booking/{id}", id));
    }

    private Response execute(Supplier<Response> call) {
        Response response = call.get();
        int attempts = 0;
        while (response.statusCode() == RATE_LIMIT_STATUS && attempts < MAX_RETRIES) {
            sleep(BACKOFF_MILLIS * (attempts + 1));
            attempts++;
            response = call.get();
        }
        return response;
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
