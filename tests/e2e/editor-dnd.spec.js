import { expect, test } from '@playwright/test';

const INSERTABLE_BLOCK_TYPES = [
  'heading',
  'text',
  'image',
  'button',
  'spacer',
  'divider',
  'group',
  'columns',
  'columns3',
];

async function dragBetween(page, fromLocator, toLocator) {
  const from = await fromLocator.boundingBox();

  if (!from) {
    throw new Error('Missing drag source bounding box');
  }

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2 + 12, { steps: 6 });

  const to = await toLocator.boundingBox();
  if (!to) {
    throw new Error('Missing drag target bounding box');
  }

  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('insertable blocks', () => {
  for (const blockType of INSERTABLE_BLOCK_TYPES) {
    test(`click insert adds ${blockType} to the root canvas`, async ({ page }) => {
      await page.getByTestId(`library-block-${blockType}`).click();

      await expect(page.getByTestId('editor-canvas').getByTestId(`block-container-${blockType}`)).toHaveCount(1);
    });

    test(`drag insert adds ${blockType} to the root canvas`, async ({ page }) => {
      await dragBetween(page, page.getByTestId(`library-block-${blockType}`), page.getByTestId('editor-canvas'));

      await expect(page.getByTestId('editor-canvas').getByTestId(`block-container-${blockType}`)).toHaveCount(1);
    });
  }
});

test('selected block can be reordered with drag and drop', async ({ page }) => {
  await page.getByTestId('library-block-heading').click();
  await page.getByTestId('library-block-text').click();

  const headingBlock = page.getByTestId('block-container-heading');
  const textBlock = page.getByTestId('block-container-text');

  await headingBlock.click();
  await dragBetween(page, headingBlock, textBlock);

  const blocks = page.getByTestId('editor-canvas').locator('[data-testid^="block-container-"]');
  await expect(blocks.nth(0)).toHaveAttribute('data-testid', 'block-container-text');
  await expect(blocks.nth(1)).toHaveAttribute('data-testid', 'block-container-heading');

  await expect(textBlock).toBeVisible();
});

test('dragging into an empty group inserts inside the inner drop area', async ({ page }) => {
  await page.getByTestId('library-block-group').click();
  const groupBlock = page.getByTestId('block-container-group');
  const innerDropZone = page.locator('[data-testid^="drop-zone-inner-"]').first();

  await dragBetween(page, page.getByTestId('library-block-text'), innerDropZone);

  await expect(groupBlock.getByTestId('block-container-text')).toHaveCount(1);
});

test('container blocks remain selectable after their children are populated', async ({ page }) => {
  await page.getByTestId('library-block-columns').click();

  await dragBetween(page, page.getByTestId('library-block-text'), page.locator('[data-testid^="drop-zone-inner-"]').first());
  await dragBetween(page, page.getByTestId('library-block-button'), page.locator('[data-testid^="drop-zone-inner-"]').first());
  await page.getByTestId('selected-parent-button').click();

  await expect(page.locator('.panel__inspector-summary h3')).toHaveText('2 Columns');
});

test('desktop and mobile modes keep the canvas editable', async ({ page }) => {
  await page.getByTestId('library-block-group').click();
  await page.getByTestId('library-block-text').click();

  const canvas = page.getByTestId('editor-canvas');
  await expect(canvas.locator('[data-testid^="block-container-"]')).toHaveCount(2);

  await page.getByRole('button', { name: 'Desktop' }).click();
  await expect(canvas.locator('[data-testid^="block-container-"]')).toHaveCount(2);

  await page.getByRole('button', { name: 'Mobile' }).click();
  await expect(canvas.locator('[data-testid^="block-container-"]')).toHaveCount(2);
  await expect(canvas.getByText('Write your email copy here.')).toBeVisible();
});
