# Admin Tour Guide System

## Overview

The Tour Guide System provides interactive, step-by-step tutorials for admin users to learn about different features and capabilities of the admin dashboard. It's designed to be non-intrusive, informative, and easy to use.

## Features

- **Interactive Tours**: Step-by-step guided tours for each admin page
- **Progress Tracking**: Tracks which tours users have completed
- **Non-Intrusive UI**: Minimal UI elements that don't clutter the interface
- **Contextual Help**: Tours are specific to each page and feature
- **Skippable**: Users can skip tours at any time
- **Resumable**: Tours can be paused and resumed later

## Architecture

### Components

1. **TourGuideService** (`mobile/services/TourGuideService.ts`)
   - Manages tour definitions and progress
   - Stores completed tours
   - Provides tour data to components

2. **TourGuideContext** (`mobile/contexts/TourGuideContext.tsx`)
   - React context for tour state management
   - Provides hooks for starting, navigating, and completing tours

3. **TourOverlay** (`mobile/components/tour/TourOverlay.tsx`)
   - Main tour UI component
   - Shows tour steps with progress indicator
   - Handles navigation between steps

4. **TourButton** (`mobile/components/tour/TourButton.tsx`)
   - Small button to trigger tours
   - Multiple variants (icon, text, full)
   - Placed in page headers

5. **TourListModal** (`mobile/components/tour/TourListModal.tsx`)
   - Shows available tours for a page
   - Displays completion status
   - Allows starting/restarting tours

6. **InfoHint** (`mobile/components/tour/InfoHint.tsx`)
   - Subtle inline help hints
   - Non-intrusive contextual information
   - Use sparingly to avoid UI clutter

## Available Tours

### 1. Products Management (`products-overview`)
- Introduction to product management
- Adding new products
- Search and filtering
- Managing collections
- Product status control

### 2. Orders Management (`orders-overview`)
- Orders dashboard overview
- Understanding order statistics
- Filtering orders by status
- Viewing order details

### 3. Finance & Refunds (`finance-overview`)
- Finance dashboard introduction
- Financial metrics explanation
- Processing refunds
- Managing refund requests
- Exporting financial reports

### 4. User Management (`users-overview`)
- User management introduction
- Searching for users
- Filtering by status
- Viewing user details

### 5. Supplier Management (`suppliers-overview`)
- Supplier management introduction
- Adding new suppliers
- Verifying suppliers
- Editing supplier information

### 6. Review Moderation (`reviews-overview`)
- Review moderation introduction
- Filtering by rating
- Responding to reviews
- Flagging inappropriate content

### 7. Page Layout (`layout-overview`)
- Page layout editor introduction
- Switching between pages
- Reordering sections
- Enabling/disabling sections
- Adding collection sections
- Saving changes

### 8. Admin Account (`account-overview`)
- Admin account overview
- Admin tools access
- Switching to customer view
- Profile settings

## Usage

### Adding Tours to a Page

1. **Import required components**:
```typescript
import { useTourGuide } from '../../../contexts/TourGuideContext';
import { tourGuideService } from '../../../services/TourGuideService';
import { TourListModal } from '../../../components/tour/TourListModal';
import { TourButton } from '../../../components/tour/TourButton';
```

2. **Add state and get tours**:
```typescript
const { startTour } = useTourGuide();
const [tourModalVisible, setTourModalVisible] = useState(false);
const availableTours = tourGuideService.getToursByPage('your-page-name');
```

3. **Add tour button to header**:
```typescript
<Header
  title="Your Page"
  subtitle="Description"
  rightAction={
    <TourButton onPress={() => setTourModalVisible(true)} variant="icon" />
  }
/>
```

4. **Add tour modal**:
```typescript
<TourListModal
  visible={tourModalVisible}
  tours={availableTours}
  onClose={() => setTourModalVisible(false)}
/>
```

5. **Add testIDs to elements** (for tour targeting):
```typescript
<TouchableOpacity testID="add-product-button">
  {/* Button content */}
</TouchableOpacity>
```

### Creating New Tours

Add new tours to `ADMIN_TOURS` array in `TourGuideService.ts`:

```typescript
{
  id: 'unique-tour-id',
  name: 'Tour Name',
  description: 'Brief description of what users will learn',
  page: 'page-identifier',
  icon: 'ionicon-name',
  category: 'getting-started' | 'advanced' | 'feature',
  steps: [
    {
      id: 'step-1',
      title: 'Step Title',
      description: 'Detailed explanation of this step',
      target: 'element-testID', // Optional: element to highlight
      placement: 'top' | 'bottom' | 'left' | 'right' | 'center',
      skippable: true, // Optional: allow skipping from this step
    },
    // More steps...
  ],
}
```

### Using InfoHint for Contextual Help

For subtle, always-visible help text:

```typescript
import { InfoHint } from '../../../components/tour/InfoHint';

// Inline hint
<InfoHint text="This section shows your active products" />

// Tooltip hint (expandable)
<InfoHint 
  text="Click to see detailed analytics" 
  variant="tooltip"
  icon="analytics-outline"
/>
```

## Design Principles

### 1. Non-Intrusive
- Tours are opt-in, not forced
- Small, unobtrusive tour buttons
- Can be dismissed at any time
- Don't block critical functionality

### 2. Informative but Concise
- Clear, actionable descriptions
- Focus on "what" and "why", not just "how"
- Use simple language
- Keep steps short (3-7 steps per tour)

### 3. Progressive Disclosure
- Start with basics ("getting-started" tours)
- Advanced features in separate tours
- Don't overwhelm with too much information

### 4. Contextual
- Tours are specific to each page
- Reference actual UI elements
- Explain real use cases

## Best Practices

### DO:
- ✅ Keep tour steps concise (2-3 sentences max)
- ✅ Use real examples and scenarios
- ✅ Add testIDs to important UI elements
- ✅ Group related features in one tour
- ✅ Test tours on actual devices
- ✅ Update tours when UI changes

### DON'T:
- ❌ Create tours for every minor feature
- ❌ Use technical jargon
- ❌ Make tours mandatory
- ❌ Add too many InfoHints (clutters UI)
- ❌ Create tours longer than 7 steps
- ❌ Forget to update tours after UI changes

## Future Enhancements

### Planned Features:
1. **Analytics**: Track which tours are most helpful
2. **Personalization**: Suggest tours based on user behavior
3. **Video Tours**: Add video demonstrations
4. **Interactive Elements**: Allow users to try actions during tours
5. **Multi-language Support**: Translate tours
6. **Tour Scheduling**: Suggest tours at optimal times
7. **Tooltips**: Persistent tooltips for complex features
8. **Search**: Search for specific help topics

### Potential Improvements:
- Spotlight effect on target elements
- Animated transitions between steps
- Voice-over support
- Keyboard navigation
- Tour completion rewards/badges
- Export tour progress for support

## Maintenance

### Regular Tasks:
1. **Review Tours Quarterly**: Ensure accuracy after UI updates
2. **Monitor Completion Rates**: Identify confusing tours
3. **Gather Feedback**: Ask users which tours are helpful
4. **Update Content**: Keep tours current with new features
5. **Test on Devices**: Verify tours work on different screen sizes

### When to Update Tours:
- UI layout changes
- New features added
- Feature behavior changes
- User feedback indicates confusion
- Analytics show low completion rates

## Troubleshooting

### Tours Not Showing
- Check TourGuideProvider is wrapping admin layout
- Verify tour page identifier matches
- Ensure TourOverlay is rendered

### Tours Not Progressing
- Check nextStep() is called correctly
- Verify tour steps array is valid
- Look for console errors

### UI Elements Not Highlighting
- Ensure testID is set on target element
- Verify target ID matches step.target
- Check element is visible when tour runs

## Support

For questions or issues with the tour system:
1. Check this documentation
2. Review tour definitions in TourGuideService.ts
3. Test in development mode
4. Check console for errors
5. Contact the development team

## Examples

See implemented examples in:
- `mobile/app/(admin)/(tabs)/products.tsx` - Full tour integration
- `mobile/app/(admin)/(tabs)/orders.tsx` - Ready for tour integration
- `mobile/app/(admin)/(tabs)/finance.tsx` - Ready for tour integration

---

**Last Updated**: 2026-04-03
**Version**: 1.0.0
