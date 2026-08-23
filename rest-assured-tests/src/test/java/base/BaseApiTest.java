package base;

import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import models.Booking;
import models.BookingDates;
import org.junit.jupiter.api.BeforeAll;

/**
 * Shared REST Assured setup. The target base URL is overridable with
 * {@code -DbaseUrl=...} so the suite can run against a self-hosted instance.
 */
public abstract class BaseApiTest {

    protected static final String DEFAULT_BASE_URL = "https://restful-booker.herokuapp.com";

    protected static final String ADMIN_USERNAME = "admin";
    protected static final String ADMIN_PASSWORD = "password123";

    protected static RequestSpecification spec;

    /** A unique, valid booking so parallel/repeat runs never collide on the shared demo backend. */
    protected static Booking sampleBooking() {
        String suffix = Long.toString(System.nanoTime());
        return new Booking(
                "Ada" + suffix.substring(suffix.length() - 6),
                "Lovelace",
                150,
                true,
                new BookingDates("2026-01-01", "2026-01-07"),
                "Breakfast");
    }

    @BeforeAll
    static void configureRestAssured() {
        String baseUrl = System.getProperty("baseUrl", DEFAULT_BASE_URL);
        RestAssured.baseURI = baseUrl;

        spec = new RequestSpecBuilder()
                .setBaseUri(baseUrl)
                .setContentType(ContentType.JSON)
                // Single-value Accept: the demo's /booking route returns 418 for the multi-value default.
                .setAccept("application/json")
                .addHeader("User-Agent", "Mozilla/5.0 (portfolio-rest-assured-tests)")
                .build();
    }
}
