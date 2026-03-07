# Requirements Document

## Introduction

This document defines requirements for an image picker abstraction layer in the AfroChinaTrade mobile app (React Native/Expo, EAS Build). The feature implements an adapter/strategy pattern over image picking functionality, with `react-native-image-picker` as the initial production implementation. The abstraction exposes a stable interface so that the underlying library can be swapped (e.g., back to `expo-image-picker` or a custom solution) without changing any consuming components. The primary use case is uploading product images in the admin dashboard.

## Glossary

- **ImagePickerService**: The stable public interface (contract) that all consuming components use to request images
- **ImagePickerAdapter**: A concrete implementation of the ImagePickerService interface backed by a specific library (e.g., `react-native-image-picker`)
- **PickedImage**: A normalized data object returned by the ImagePickerService representing a single selected image
- **PickOptions**: A configuration object passed to the ImagePickerService to control selection behavior (source, count, quality, etc.)
- **PermissionStatus**: An enumerated result indicating whether the app has been granted, denied, or has not yet requested the relevant OS permission
- **ImageSource**: An enumeration of available image sources — `CAMERA` or `LIBRARY`
- **Adapter**: The single file that wraps a third-party library and maps its API to the ImagePickerService interface
- **Consumer**: Any component or hook in the app that calls ImagePickerService methods

## Requirements

### Requirement 1: Stable Public Interface

**User Story:** As a developer, I want a stable, library-agnostic interface for picking images, so that I can swap the underlying implementation without touching any consuming component.

#### Acceptance Criteria

1. THE ImagePickerService SHALL expose a `pickImages(options: PickOptions): Promise<PickedImage[]>` method as its primary entry point
2. THE ImagePickerService SHALL expose a `checkPermission(source: ImageSource): Promise<PermissionStatus>` method
3. THE ImagePickerService SHALL expose a `requestPermission(source: ImageSource): Promise<PermissionStatus>` method
4. THE PickedImage type SHALL contain at minimum: `uri: string`, `fileName: string | null`, `mimeType: string | null`, `width: number`, `height: number`, `fileSize: number | null`
5. THE PickOptions type SHALL contain at minimum: `source: ImageSource`, `maxCount: number`, `quality: number` (0.0–1.0), `maxWidth: number | null`, `maxHeight: number | null`
6. THE ImagePickerService interface SHALL be defined in a dedicated TypeScript file that contains no import of any third-party image-picking library
7. WHEN a new Adapter is created, THE Adapter SHALL implement the ImagePickerService interface without requiring changes to any Consumer

### Requirement 2: Adapter Implementation (react-native-image-picker)

**User Story:** As a developer, I want a production-ready adapter backed by `react-native-image-picker`, so that image picking works reliably on both iOS and Android in EAS builds.

#### Acceptance Criteria

1. THE ImagePickerAdapter SHALL implement every method defined in the ImagePickerService interface
2. WHEN `pickImages` is called with `source: CAMERA`, THE ImagePickerAdapter SHALL invoke the device camera via `react-native-image-picker`
3. WHEN `pickImages` is called with `source: LIBRARY`, THE ImagePickerAdapter SHALL open the photo library via `react-native-image-picker`
4. THE ImagePickerAdapter SHALL map the library's response fields to the normalized PickedImage shape before returning results to the Consumer
5. WHEN the user cancels the picker without selecting an image, THE ImagePickerAdapter SHALL return an empty array
6. IF the library returns an error response, THEN THE ImagePickerAdapter SHALL throw a typed `ImagePickerError` with a `code` and `message` field
7. THE ImagePickerAdapter SHALL be the only file in the codebase that imports `react-native-image-picker`

### Requirement 3: Permission Handling

**User Story:** As a user, I want the app to request only the permissions it needs and explain why, so that I can trust the app and grant access confidently.

#### Acceptance Criteria

1. WHEN `pickImages` is called and the required permission has not been granted, THE ImagePickerAdapter SHALL call `requestPermission` before launching the picker
2. WHEN `requestPermission` is called for `CAMERA`, THE ImagePickerAdapter SHALL request the OS camera permission on both iOS and Android
3. WHEN `requestPermission` is called for `LIBRARY`, THE ImagePickerAdapter SHALL request the OS photo library / media permission on both iOS and Android
4. WHEN a permission is permanently denied by the user, THE ImagePickerAdapter SHALL throw an `ImagePickerError` with `code: 'PERMISSION_DENIED'`
5. THE ImagePickerService SHALL expose `PermissionStatus` values: `GRANTED`, `DENIED`, `BLOCKED`, and `UNDETERMINED`
6. IF the user has previously blocked a permission, THEN THE ImagePickerAdapter SHALL throw an `ImagePickerError` with `code: 'PERMISSION_BLOCKED'` and a `message` directing the user to open device Settings

### Requirement 4: Multiple Image Selection

**User Story:** As a seller, I want to select multiple product images in a single picker session, so that I can upload all photos for a product without repeating the flow.

#### Acceptance Criteria

1. WHEN `PickOptions.maxCount` is greater than 1, THE ImagePickerAdapter SHALL configure the picker to allow multi-selection up to `maxCount` images
2. WHEN `PickOptions.maxCount` is 1, THE ImagePickerAdapter SHALL configure the picker for single-selection mode
3. THE ImagePickerService SHALL enforce that `maxCount` is a positive integer between 1 and 10 inclusive; IF an out-of-range value is provided, THEN THE ImagePickerService SHALL throw an `ImagePickerError` with `code: 'INVALID_OPTIONS'`
4. WHEN the user selects images, THE ImagePickerAdapter SHALL return all selected images as a `PickedImage[]` array in the order they were selected
5. WHEN `source` is `CAMERA`, THE ImagePickerAdapter SHALL set `maxCount` to 1 regardless of the value in PickOptions, because the camera captures one image at a time

### Requirement 5: Image Compression and Quality Control

**User Story:** As a developer, I want to control image quality and dimensions before upload, so that product images are optimized for storage and network transfer without sacrificing visual quality.

#### Acceptance Criteria

1. WHEN `PickOptions.quality` is provided, THE ImagePickerAdapter SHALL pass the quality value to the underlying library's compression setting
2. THE ImagePickerService SHALL enforce that `quality` is a number in the range [0.0, 1.0]; IF an out-of-range value is provided, THEN THE ImagePickerService SHALL throw an `ImagePickerError` with `code: 'INVALID_OPTIONS'`
3. WHEN `PickOptions.maxWidth` or `PickOptions.maxHeight` is provided, THE ImagePickerAdapter SHALL pass those constraints to the underlying library so the returned image does not exceed those pixel dimensions
4. WHEN neither `maxWidth` nor `maxHeight` is provided, THE ImagePickerAdapter SHALL apply a default maximum dimension of 2048 pixels on the longest side
5. THE PickedImage SHALL include the actual `width`, `height`, and `fileSize` of the image after compression so Consumers can display accurate metadata

### Requirement 6: Adapter Registration and Dependency Injection

**User Story:** As a developer, I want to register and retrieve the active adapter from a single location, so that swapping implementations is a one-file change with no impact on Consumers.

#### Acceptance Criteria

1. THE ImagePickerService module SHALL provide a `setAdapter(adapter: ImagePickerAdapter)` function to register the active implementation at app startup
2. THE ImagePickerService module SHALL provide a `getAdapter(): ImagePickerAdapter` function that returns the currently registered adapter
3. WHEN `getAdapter` is called before `setAdapter` has been called, THE ImagePickerService SHALL throw an `ImagePickerError` with `code: 'NO_ADAPTER_REGISTERED'`
4. THE app entry point SHALL call `setAdapter` once with the `ReactNativeImagePickerAdapter` during initialization
5. WHERE a test environment is active, THE ImagePickerService SHALL allow a mock adapter to be registered via `setAdapter` to replace the real implementation without modifying production code

### Requirement 7: Error Handling and Typed Errors

**User Story:** As a developer, I want all image picker errors to be typed and distinguishable, so that Consumers can handle specific failure modes gracefully.

#### Acceptance Criteria

1. THE ImagePickerService SHALL define an `ImagePickerError` class that extends `Error` and includes a `code: ImagePickerErrorCode` field
2. THE ImagePickerErrorCode type SHALL include at minimum: `'PERMISSION_DENIED'`, `'PERMISSION_BLOCKED'`, `'INVALID_OPTIONS'`, `'NO_ADAPTER_REGISTERED'`, `'PICKER_ERROR'`, `'CANCELLED'`
3. WHEN the user cancels the picker, THE ImagePickerAdapter SHALL return an empty array rather than throwing a `'CANCELLED'` error, to simplify Consumer logic
4. WHEN an unexpected library error occurs, THE ImagePickerAdapter SHALL catch it and re-throw it as an `ImagePickerError` with `code: 'PICKER_ERROR'` and the original message preserved
5. THE ImagePickerError SHALL be exported from the ImagePickerService module so Consumers can use `instanceof ImagePickerError` checks

### Requirement 8: Serialization and Normalization (Round-Trip)

**User Story:** As a developer, I want the PickedImage data to be serializable and stable across adapter implementations, so that Consumers are not coupled to any library-specific response shape.

#### Acceptance Criteria

1. THE ImagePickerAdapter SHALL produce PickedImage objects whose fields contain only JSON-serializable primitive types (string, number, null)
2. THE ImagePickerService SHALL define a `serializePickedImage(image: PickedImage): string` function that serializes a PickedImage to a JSON string
3. THE ImagePickerService SHALL define a `deserializePickedImage(json: string): PickedImage` function that parses a JSON string back into a PickedImage
4. FOR ALL valid PickedImage objects, calling `deserializePickedImage(serializePickedImage(image))` SHALL produce an object deeply equal to the original (round-trip property)
5. IF `deserializePickedImage` receives a string that does not conform to the PickedImage schema, THEN THE ImagePickerService SHALL throw an `ImagePickerError` with `code: 'PICKER_ERROR'` and a descriptive message
