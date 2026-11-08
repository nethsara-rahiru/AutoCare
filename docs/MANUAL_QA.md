# Android acceptance checklist

These are remaining manual checks, not claimed device-test results. The cloud executor has Chromium but no Android SDK/adb or attached phone.

## Prepare

1. Use Node 24+, `npm ci`, and an Expo Go release compatible with SDK 58.
2. Run `npx expo start`; connect the Android phone to the development machine's network and scan the QR code in Expo Go. `npm run android` works with an already configured Android emulator/SDK.
3. Confirm 3 demo vehicles, 12 services, 15 fuel entries, and 6 reminders on first installation. Demo records are fictional and editable.
4. For a self-contained offline demonstration, build/install the release APK using local Android tooling (commands in README). Expo Go initially needs Metro to obtain the JS bundle; a release APK bundles it locally.

## Core flows

- Navigate all five tabs; open vehicle details, all add/edit forms, and reminders. Check Android back navigation and tab active states.
- Search nickname, make, model, and registration. Add a vehicle, edit it, and reject a case-insensitive duplicate registration. Reject missing make/model/year and negative/fractional mileage.
- Pick a device photo. Deny permission and confirm that a useful message appears. Pick successfully, restart, and confirm the photo remains.
- Add/edit/delete services; test all category and vehicle filters, workshop/notes search, oldest/newest and cost sorting. Verify amounts appear on dashboard, details, and reports immediately.
- Add two consecutive full-tank fuel entries with increasing mileage. Confirm distance/later litres. Add a partial fill between full tanks and confirm the broken interval is not used. Confirm zero litres, negative costs, and chronological odometer conflicts are rejected.
- Confirm older service/fuel readings never lower mileage. Vehicle edit must reject mileage below recorded history.
- Reports: all vehicles, one vehicle, inclusive from/to boundaries, blank dates, invalid dates, reversed range, empty period, monthly/category/comparison charts, and LKR amounts.
- Reminders: create a date-only target tomorrow/today/yesterday and a mileage-only target above/equal/below current mileage. Test combined targets; overdue wins over due. Complete, edit, and delete. Restart and verify completion remains.
- Delete a test vehicle only after checking the confirmation dialog. Confirm cancel preserves it; confirm delete removes all its related records. Never use a real vehicle for destructive tests.
- Delete demo records, restart, and confirm they are not reseeded. Clear all vehicles to check dashboard, lists, forms, and reports empty states.

## Offline and persistence

1. Launch the installed release APK, enable airplane mode, and disable Wi-Fi.
2. Create/edit/delete a vehicle, service, fuel log, and reminder; use search and every filter.
3. Open details, dashboard, and reports. Confirm charts and local photos display and totals update.
4. Force-stop the app, relaunch while still offline, and confirm the same saved records remain.
5. Rotate or use smaller screens where supported; test large system font sizes, scrollable forms with keyboard visible, safe areas, TalkBack labels, and destructive confirmations.

Record actual device model, Android version, APK/build mode, test date, and outcomes before submission. Native image-picker behavior, Android keyboard/safe-area behavior, release installation, and airplane-mode cold launch remain unverified until this checklist is executed.
