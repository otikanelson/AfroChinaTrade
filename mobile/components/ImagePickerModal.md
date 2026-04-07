# ImagePickerModal Component

A reusable modal component for selecting profile images with camera, gallery, and remove options.

## Features

- **Bottom Sheet Design**: Slides up from bottom with smooth animation
- **Multiple Options**: Camera, gallery, and remove photo options
- **Visual Feedback**: Icons and descriptions for each option
- **Confirmation Dialog**: Asks for confirmation before removing photos
- **Responsive Design**: Adapts to different screen sizes and themes
- **Accessibility**: Proper touch targets and visual indicators

## Usage

```tsx
import { ImagePickerModal } from '../components/ImagePickerModal';

const [showImagePicker, setShowImagePicker] = useState(false);

<ImagePickerModal
  visible={showImagePicker}
  onClose={() => setShowImagePicker(false)}
  onCamera={() => pickImage('camera')}
  onGallery={() => pickImage('library')}
  onRemove={avatar ? removeAvatar : undefined}
  hasImage={!!avatar}
/>
```

## Props

- `visible`: boolean - Controls modal visibility
- `onClose`: () => void - Called when modal should be closed
- `onCamera`: () => void - Called when camera option is selected
- `onGallery`: () => void - Called when gallery option is selected
- `onRemove?`: () => void - Called when remove option is selected (optional)
- `hasImage?`: boolean - Whether user has an existing image (shows remove option)

## Options Provided

### 1. Take Photo
- Uses device camera to capture new photo
- Primary color icon with camera symbol
- Descriptive text explaining the action

### 2. Choose from Gallery
- Opens device photo library
- Secondary color icon with images symbol
- Allows selection from existing photos

### 3. Remove Photo (Conditional)
- Only shown when `hasImage` is true and `onRemove` is provided
- Error color styling to indicate destructive action
- Shows confirmation dialog before removal

### 4. Cancel
- Closes modal without action
- Neutral styling with close icon
- Always available option

## Design Features

- **Handle Bar**: Visual indicator for swipe-to-dismiss
- **Backdrop Dismiss**: Tap outside to close
- **Smooth Animation**: Slide up/down animation
- **Theme Integration**: Uses app colors and spacing
- **Visual Hierarchy**: Clear option separation with borders

## Integration

The modal integrates seamlessly with:
- **Profile Pages**: Main use case for avatar selection
- **Theme System**: Automatic color and spacing adaptation
- **Image Picker**: Works with expo-image-picker
- **Alert System**: Confirmation dialogs for destructive actions

## Accessibility

- Large touch targets (40px icons)
- Clear visual hierarchy
- Descriptive text for each option
- Proper contrast ratios
- Screen reader friendly structure