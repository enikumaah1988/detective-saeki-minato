# Reproducible review layout only: crop and arrange existing pixels, no repainting.
Add-Type -AssemblyName System.Drawing
$akariRepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../../..')).Path
$akariCanvas = [System.Drawing.Bitmap]::new(1280,800)
$akariGraphics = [System.Drawing.Graphics]::FromImage($akariCanvas)
$akariGraphics.Clear([System.Drawing.Color]::FromArgb(240,243,246))
$akariGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$akariGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$akariTitleFont = [System.Drawing.Font]::new('Yu Gothic',28)
$akariNoteFont = [System.Drawing.Font]::new('Yu Gothic',17)
$akariInk = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(35,45,55))
$akariReviewSources = @(
    @{ Path = 'src/assets/images/characters/mio/waist/neutral.png'; X = 50; Title = '相澤 澪 / 32歳'; Crop = [System.Drawing.RectangleF]::new(330,50,340,340) },
    @{ Path = 'docs/art/characters/akari/design.png'; X = 680; Title = '高瀬 あかり / 21歳・試作3'; Crop = [System.Drawing.RectangleF]::new(360,0,280,280) }
)
foreach ($akariSource in $akariReviewSources) {
    $akariGraphics.DrawString($akariSource.Title,$akariTitleFont,$akariInk,$akariSource.X,35)
    $akariGraphics.FillRectangle([System.Drawing.Brushes]::White,$akariSource.X,120,550,550)
    $akariImage = [System.Drawing.Image]::FromFile((Join-Path $akariRepoRoot $akariSource.Path))
    $akariDestination = [System.Drawing.RectangleF]::new($akariSource.X,120,550,550)
    $akariGraphics.DrawImage($akariImage,$akariDestination,$akariSource.Crop,[System.Drawing.GraphicsUnit]::Pixel)
    $akariImage.Dispose()
}
$akariGraphics.DrawString('顔と髪の識別性を確認するための切り出し比較',$akariNoteFont,$akariInk,50,710)
$akariGraphics.DrawString('比較用の拡大率。本編の身長・表示倍率を示すものではありません。',$akariNoteFont,$akariInk,50,748)
$akariCanvas.Save((Join-Path $PSScriptRoot 'mio-akari-face-comparison-03.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$akariGraphics.Dispose()
$akariCanvas.Dispose()
$akariTitleFont.Dispose()
$akariNoteFont.Dispose()
$akariInk.Dispose()
