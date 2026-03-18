// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn()
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="map-marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  Polyline: () => null,
  useMap: () => ({ fitBounds: jest.fn() })
}));

jest.mock('leaflet', () => ({
  latLngBounds: jest.fn(() => ({})),
  icon: jest.fn(() => ({})),
  Icon: Object.assign(
    function MockIcon() {},
    {
      Default: Object.assign(function DefaultIcon() {}, {
        prototype: {},
        mergeOptions: jest.fn()
      })
    }
  )
}));
