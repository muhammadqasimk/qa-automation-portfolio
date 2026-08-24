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
    }

    @Test
        @DisplayName("Creating with missing required fields is not handled as a clean 400 validation error")
    void createWithMissingFields_isNotValidated() {
        // Only firstname supplied - required fields (dates, price) omitted.
        var response = client.createBookingRaw("{\"firstname\":\"Incomplete\"}");

        assertNotEquals(400, response.statusCode(),
            "The defect is that invalid input is not reported as a client validation error");
    }
}
