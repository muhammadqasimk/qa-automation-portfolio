package tests;

import base.BaseApiTest;
import clients.RestfulBookerClient;
import io.restassured.response.Response;
import models.AuthCredentials;
import models.Booking;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Booking CRUD - create, read, update, delete")
class BookingCrudApiTest extends BaseApiTest {

    private static RestfulBookerClient client;
    private static String token;

    @BeforeAll
    static void initClient() {
        client = new RestfulBookerClient(spec);
        token = client.getToken(new AuthCredentials(ADMIN_USERNAME, ADMIN_PASSWORD));
    }

    @Test
    @DisplayName("Create returns a booking id and echoes the payload")
    void createBooking_returnsId() {
        Booking booking = sampleBooking();
        Response response = client.createBooking(booking);

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getInt("bookingid"), greaterThan(0));
        assertThat(response.jsonPath().getString("booking.firstname"), equalTo(booking.getFirstname()));
    }

    @Test
    @DisplayName("Read by id returns the created booking")
    void getBookingById_returnsBooking() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        Response response = client.getBooking(id);

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getInt("totalprice"), equalTo(150));
    }

    @Test
    @DisplayName("Full update (PUT) with a valid token replaces the booking")
    void putUpdate_withToken_updatesBooking() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        Booking updated = sampleBooking();
        updated.setFirstname("Grace");
        updated.setTotalprice(999);

        Response response = client.updateBooking(id, updated, token);

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getString("firstname"), equalTo("Grace"));
        assertThat(response.jsonPath().getInt("totalprice"), equalTo(999));
    }

    @Test
    @DisplayName("Partial update (PATCH) with a valid token changes only sent fields")
    void patchUpdate_withToken_updatesField() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        Response response = client.partialUpdate(id, "{\"firstname\":\"Alan\"}", token);

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getString("firstname"), equalTo("Alan"));
    }

    @Test
    @DisplayName("Delete with a valid token removes the booking")
    void deleteBooking_withToken_removesBooking() {
        int id = client.createBooking(sampleBooking()).jsonPath().getInt("bookingid");

        int deleteStatus = client.deleteBooking(id, token).statusCode();
        assertTrue(deleteStatus == 201 || deleteStatus == 204,
                "Expected 201 or 204 on delete but got " + deleteStatus);

        assertEquals(404, client.getBooking(id).statusCode());
    }
}
