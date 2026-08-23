package tests;

import base.BaseApiTest;
import clients.RestfulBookerClient;
import models.AuthCredentials;
import models.Booking;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

/**
 * Documents known non-standard behaviours of the Restful-Booker demo API.
 * These tests assert the API's actual (quirky) responses so regressions in the
 * documented behaviour are caught, and serve as living defect documentation.
 */
@DisplayName("Restful-Booker documented quirks")
class BookingKnownIssuesApiTest extends BaseApiTest {

    private static RestfulBookerClient client;
    private static String token;

    @BeforeAll
    static void initClient() {
        client = new RestfulBookerClient(spec);
        token = client.getToken(new AuthCredentials(ADMIN_USERNAME, ADMIN_PASSWORD));
    }

    @Test
    @DisplayName("DELETE returns 201 Created instead of the RESTful 204 No Content")
    void deleteReturns201_notStandard204() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        int status = client.deleteBooking(id, token).statusCode();
        assertEquals(201, status,
                "Restful-Booker is known to return 201 on DELETE; standard would be 204");
    }

    @Test
    @DisplayName("Mutating without a token returns 403 Forbidden instead of 401 Unauthorized")
    void updateWithoutAuthReturns403_not401() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        Booking updated = sampleBooking();
        int status = client.updateBookingWithoutAuth(id, updated).statusCode();

        assertEquals(403, status,
                "Missing auth returns 403 here; a stricter API would return 401");
        assertNotEquals(401, status);
    }

    @Test
    @DisplayName("Creating with missing required fields is not rejected with 400")
    void createWithMissingFields_isNotValidated() {
        // Only firstname supplied - required fields (dates, price) omitted.
        int status = client.createBookingRaw("{\"firstname\":\"Incomplete\"}").statusCode();

        // The API does not perform request validation, so it never returns 400 Bad Request.
        assertNotEquals(400, status,
                "No field validation: the API does not reject an incomplete payload with 400");
    }
}
