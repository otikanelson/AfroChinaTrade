import React from 'react';
import { render } from '@testing-library/react-native';
import { OptimizedProductImage } from '../OptimizedProductImage';

describe('OptimizedProductImage', () => {
  const defaultProps = {
    source: 'https://example.com/image.jpg',
    width: 200,
    height: 200,
  };

  it('renders without crashing', () => {
    const component = render(<OptimizedProductImage {...defaultProps} />);
    expect(component).toBeTruthy();
  });

  it('renders with empty source', () => {
    const component = render(
      <OptimizedProductImage 
        source="" 
        width={200} 
        height={200} 
        placeholder="No Image Available" 
      />
    );
    expect(component).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const component = render(
      <OptimizedProductImage 
        source="https://example.com/image.jpg"
        width={100}
        height={150}
      />
    );
    expect(component).toBeTruthy();
  });

  it('renders with custom quality and format', () => {
    const component = render(
      <OptimizedProductImage 
        source="https://res.cloudinary.com/demo/image/upload/sample.jpg"
        width={100}
        height={100}
        quality={90}
        format="webp"
      />
    );
    expect(component).toBeTruthy();
  });
});