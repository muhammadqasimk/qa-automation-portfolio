package tests;

import base.BaseApiTest;
import clients.RestfulBookerClient;
import io.restassured.response.Response;
import models.Booking;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("Booking search - GET /booking with and without filters")
class BookingSearchApiTest extends BaseApiTest {

    private static RestfulBookerClient client;
    private static int seededId;
    private static Booking seeded;

    @BeforeAll
    static void seedBooking() {
        client = new RestfulBookerClient(spec);
        seeded = sampleBooking();
        seededId = client.createBooking(seeded).jsonPath().getInt("bookingid");
    }

    @Test
    @DisplayName("Unfiltered list returns booking ids")
    void listAllIds_returnsNonEmpty() {
        Response response = client.getAllBookingIds();

        assertEquals(200, response.statusCode());
        List<Integer> ids = response.jsonPath().getList("bookingid");
        assertThat(ids.size(), greaterThan(0));
        assertThat(ids, hasItem(seededId));
    }

    @Test
    @DisplayName("Filtering by name returns the matching booking")
    void filterByName_returnsMatch() {
        Response response = client.getBookingIdsByName(seeded.getFirstname(), seeded.getLastname());

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getList("bookingid"), hasItem(seededId));
    }

    @Test
    @DisplayName("Filtering by a non-existent name returns an empty result")
    void filterByUnknownName_returnsEmpty() {
        Response response = client.getBookingIdsByName("Nonexistent" + System.nanoTime(), "Ghost");

        assertEquals(200, response.statusCode());
        assertThat(response.jsonPath().getList("bookingid"), hasSize(0));
    }
}
