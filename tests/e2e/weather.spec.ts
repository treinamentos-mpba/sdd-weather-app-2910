import { expect, test } from '@playwright/test';

const geocodingFixture = {
  results: [
    {
      id: 2267057,
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.14,
      admin1: 'Lisboa',
      country: 'Portugal',
      country_code: 'PT',
      timezone: 'Europe/Lisbon',
    },
  ],
};

const forecastFixture = {
  timezone: 'Europe/Lisbon',
  current: {
    time: '2026-10-29T12:00',
    temperature_2m: 0,
    weather_code: 0,
    relative_humidity_2m: 65,
    wind_speed_10m: 8,
    precipitation: 0,
    surface_pressure: 1015,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    temperature_2m_min: [-2, 1, 3, 4, 2],
    temperature_2m_max: [8, 10, 12, 13, 11],
    weather_code: [0, 1, 2, 3, 61],
    precipitation_probability_max: [0, 10, 20, 35, 80],
  },
};

test('busca uma cidade, mostra a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search\?/, async (route) => {
    await route.fulfill({ json: geocodingFixture });
  });

  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast\?/, async (route) => {
    await route.fulfill({ json: forecastFixture });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weatherRegion = page.getByRole('region', { name: 'Clima atual em Lisboa' });
  await expect(weatherRegion.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(weatherRegion.getByText('0°C')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão para cinco dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(weatherRegion.getByText('32°F')).toBeVisible();
});

test('mostra estado vazio e não consulta forecast quando geocoding retorna sem results', async ({
  page,
}) => {
  let forecastRequests = 0;

  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search\?/, async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast\?/, async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastFixture });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Cidade sem resultados');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test('busca e mostra o clima no viewport mobile de 375 × 812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route(/https:\/\/geocoding-api\.open-meteo\.com\/v1\/search\?/, async (route) => {
    await route.fulfill({ json: geocodingFixture });
  });

  await page.route(/https:\/\/api\.open-meteo\.com\/v1\/forecast\?/, async (route) => {
    await route.fulfill({ json: forecastFixture });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weatherRegion = page.getByRole('region', { name: 'Clima atual em Lisboa' });
  await expect(weatherRegion.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(weatherRegion.getByText('0°C')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão para cinco dias' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
