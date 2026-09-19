-- ============================================================================
-- Hotel Sai Aman — Seed data (idempotent upserts)
-- Mirrors the original static content so the site looks identical, now DB-backed.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------------
INSERT INTO "rooms" ("id","slug","name","description","beds","max_guests","size_sqm","price_per_night","currency","total_units","amenities","gallery","featured","active","sort_order")
VALUES
(
  'double','double','Double Room',
  'A serene retreat with a plush queen bed, warm textiles and a dedicated work desk.',
  '1 Queen bed', 2, 22, 3200, 'NPR', 6,
  '["private-bathroom","free-wifi","desk","carpeting","flat-screen-tv"]'::jsonb,
  '[{"src":"/images/room-double.png","alt":"Double room with queen bed"},{"src":"/images/room-detail.png","alt":"Room bedside detail"},{"src":"/images/room-bath.png","alt":"Private bathroom"}]'::jsonb,
  false, true, 1
),
(
  'twin','twin','Twin Room',
  'Two comfortable single beds, ideal for friends or colleagues travelling together.',
  '2 Single beds', 2, 24, 3500, 'NPR', 4,
  '["private-bathroom","free-wifi","desk","carpeting","flat-screen-tv"]'::jsonb,
  '[{"src":"/images/room-twin.png","alt":"Twin room with two single beds"},{"src":"/images/room-detail.png","alt":"Room bedside detail"},{"src":"/images/room-bath.png","alt":"Private bathroom"}]'::jsonb,
  false, true, 2
),
(
  'triple','triple','Triple Room',
  'Our most spacious room with a double and single bed, air conditioning and room service.',
  '1 Double + 1 Single bed', 3, 30, 4800, 'NPR', 3,
  '["private-bathroom","free-wifi","desk","carpeting","air-conditioning","flat-screen-tv","room-service"]'::jsonb,
  '[{"src":"/images/room-triple.png","alt":"Triple room, air conditioned"},{"src":"/images/room-detail.png","alt":"Room bedside detail"},{"src":"/images/room-bath.png","alt":"Private bathroom"}]'::jsonb,
  true, true, 3
)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- Settings: taxes/fees + booking rules
-- ---------------------------------------------------------------------------
INSERT INTO "settings" ("key","value") VALUES
(
  'pricing',
  '{"currency":"NPR","taxPercent":13,"serviceFeePercent":10,"taxLabel":"VAT (13%)","serviceFeeLabel":"Service charge (10%)"}'::jsonb
),
(
  'booking',
  '{"minNights":1,"maxNights":30,"maxGuestsPerBooking":6,"checkInTime":"14:00","checkOutTime":"12:00","cancellationHours":24,"allowGuestCheckout":true}'::jsonb
),
(
  'hotel',
  '{"name":"Hotel Sai Aman","legalName":"Hotel Sai Aman Pvt. Ltd.","phone":"+977 000 000 0000","email":"stay@hotelsaiaman.com","address":"New Bus Park, Butwal, Lumbini Province, Nepal","panVat":""}'::jsonb
)
ON CONFLICT ("key") DO NOTHING;

-- ---------------------------------------------------------------------------
-- CMS content blocks
-- ---------------------------------------------------------------------------
INSERT INTO "cms_content" ("key","value") VALUES
(
  'hero',
  '{"title":"Comfort at the Heart of Butwal","subtitle":"A calm, contemporary stay moments from New Bus Park — warm hospitality, spotless rooms and easy access to Lumbini.","ctaLabel":"Book Your Stay"}'::jsonb
),
(
  'contact',
  '{"phone":"+977 000 000 0000","email":"stay@hotelsaiaman.com","address":"New Bus Park, Butwal","city":"Butwal","province":"Lumbini Province","country":"Nepal","postalCode":"32907"}'::jsonb
),
(
  'policies',
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","cancellation":"Free cancellation up to 24 hours before check-in.","children":"Children are welcome. Extra beds on request.","pets":"Pets are not permitted.","smoking":"Non-smoking property."}'::jsonb
),
(
  'footer',
  '{"tagline":"Comfort at the Heart of Butwal","social":[{"label":"Facebook","href":"#"},{"label":"Instagram","href":"#"},{"label":"WhatsApp","href":"#"}]}'::jsonb
)
ON CONFLICT ("key") DO NOTHING;

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------
INSERT INTO "faqs" ("id","question","answer","sort_order","active") VALUES
('f1','What time is check-in and check-out?','Check-in is from 2:00 PM and check-out is by 12:00 PM. Early check-in and late check-out can be arranged on request, subject to availability.',1,true),
('f2','Do you offer airport pickup?','Yes. We can arrange pickup from Gautam Buddha International Airport. Please share your flight details in advance.',2,true),
('f3','Is parking available?','Free on-site parking is available for all guests.',3,true),
('f4','Is breakfast included?','Room rates can include breakfast at The Aman Kitchen depending on the selected offer. Details are shown during booking.',4,true)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- Reviews (pre-approved so they display like the original)
-- ---------------------------------------------------------------------------
INSERT INTO "reviews" ("id","author","country","rating","quote","stay_type","approved","featured") VALUES
('r1','Anish P.','Nepal',9,'Spotless rooms and incredibly helpful staff. The location right by New Bus Park made travel effortless.','Business trip',true,true),
('r2','Priya S.','India',8,'Stayed on our way to Lumbini. Comfortable beds, great value, and a lovely rooftop terrace.','Pilgrimage',true,true),
('r3','David M.','United Kingdom',7,'A solid, clean and friendly hotel. Perfect base for exploring Butwal and the airport is close by.','Leisure',true,true)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
INSERT INTO "gallery" ("id","src","alt","category","sort_order","active") VALUES
('g1','/images/exterior-day.png','Hotel exterior by day','exterior',1,true),
('g2','/images/exterior-night.png','Hotel exterior at night','exterior',2,true),
('g3','/images/room-double.png','Double room','rooms',3,true),
('g4','/images/room-triple.png','Triple room','rooms',4,true),
('g5','/images/dining.png','The Aman Kitchen','dining',5,true),
('g6','/images/terrace.png','Rooftop terrace lounge','dining',6,true)
ON CONFLICT ("id") DO NOTHING;

-- ---------------------------------------------------------------------------
-- Offers + a welcome coupon
-- ---------------------------------------------------------------------------
INSERT INTO "offers" ("id","title","description","badge","coupon_code","cta_label","active","sort_order") VALUES
('o1','Early Bird Escape','Book at least 14 days ahead and save on your stay in Butwal.','Save 10%','WELCOME10','Book Now',true,1),
('o2','Extended Stay','Stay 3 nights or more and enjoy a complimentary rooftop dinner.','3+ nights',NULL,'Explore',true,2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "coupons" ("id","code","description","type","value","min_nights","min_amount","active") VALUES
('c1','WELCOME10','10% off your first stay','percent',10,1,0,true)
ON CONFLICT ("id") DO NOTHING;
