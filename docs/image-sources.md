# Venue imagery

Updated 20 September 2026 after reviewing Google Images and venue image-search results. Each photograph was chosen to show a relevant physical venue, rather than a couple, bouquet, or unrelated wedding close-up.

These are reference photographs for the fictional local demo listings, not photographs of properties named Marigold, Amara, Saanjh, Mango Grove, Gulmohar, or Aangan. Existing demo descriptions identify the imagery as illustrative. Search visibility does not establish permission for commercial reuse; use vendor-provided or appropriately licensed photographs for published listings.

| Placement | Actual subject and reason | Source |
| --- | --- | --- |
| Homepage hero; The Marigold Gardens | Vatika Lawn, Sayaji Raipur: wide outdoor lawn with tables, palms, and daylight. Matches the garden category and venue-discovery homepage. | [Spalba — Sayaji Raipur](https://spalba.com/properties/sayaji-raipur-1742) |
| Amara Grand Ballroom | Mahal Banquet, Sayaji Raipur: indoor hall, chandeliers, and arranged tables. | [Sayaji Hotels — Mahal](https://sayajihotels.com/sayaji-raipur/banquet/mahal) |
| Saanjh Riverside Retreat | Chhattisgarh resort cottages and landscaped grounds beside waterfalls. Matches a natural riverside resort setting; does not claim to be Bilaspur. | [Chhattisgarh Tourism Board — Hotels](https://tourism.cgstate.gov.in/hotels) |
| The Mango Grove | Dr. Gajwani Farmhouse, Raipur: real farmhouse, pool, lawn, and countryside. | [FamilyFarms — Dr. Gajwani Farmhouse](https://familyfarms.in/farm-house-details.php?search_date=&title=Dr.-Gajwani-Farmhouse) |
| Gulmohar Courtyard | Tropicana at Gaurav Garden, Raipur: landscaped outdoor celebration space. | [VenueLook — Gaurav Garden](https://www.venuelook.com/raipur/tropicana-of-gaurav-garden-in-vishal-nagar) |
| Aangan Celebration Hall | Pearl Hall, Sayaji Raipur: indoor banquet seating and warm lighting. | [Sayaji Hotels — Raipur](https://sayajihotels.com/sayaji-raipur) |

Images remain hosted at their original source URLs. Exact URLs are in `backend/app/bootstrap.py`; the hero uses the same Vatika Lawn photo in `frontend/app/globals.css`.

To update an existing local demo without resetting users or bookings:

```powershell
cd backend
.\.venv\Scripts\python.exe -m app.bootstrap --demo --refresh-demo-photos
```

The refresh only changes old Unsplash image URLs on seeded venues owned by the demo vendor. It leaves custom photos and all other records untouched.
