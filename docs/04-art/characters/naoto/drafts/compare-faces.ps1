# Reproducible review layout only: crop and arrange existing pixels, no repainting.
Add-Type -AssemblyName System.Drawing
$naotoRepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../../../..')).Path
$naotoCanvas = [System.Drawing.Bitmap]::new(1280,800)
$naotoGraphics = [System.Drawing.Graphics]::FromImage($naotoCanvas)
$naotoGraphics.Clear([System.Drawing.Color]::FromArgb(240,243,246))
$naotoGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$naotoGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$naotoTitleFont = [System.Drawing.Font]::new('Yu Gothic',28)
$naotoNoteFont = [System.Drawing.Font]::new('Yu Gothic',17)
$naotoInk = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(35,45,55))
$naotoReviewSources = @(
    @{ Path = 'src/assets/images/characters/segawa/waist/neutral.png'; X = 50; Title = '瀬川 亮介 / 27歳'; Crop = [System.Drawing.RectangleF]::new(370,35,350,350) },
    @{ Path = 'docs/04-art/characters/naoto/drafts/prototype-02.png'; X = 680; Title = '高瀬 直人 / 29歳・修正案'; Crop = [System.Drawing.RectangleF]::new(350,0,280,280) }
)
foreach ($naotoSource in $naotoReviewSources) {
    $naotoGraphics.DrawString($naotoSource.Title,$naotoTitleFont,$naotoInk,$naotoSource.X,35)
    $naotoGraphics.FillRectangle([System.Drawing.Brushes]::White,$naotoSource.X,120,550,550)
    $naotoImage = [System.Drawing.Image]::FromFile((Join-Path $naotoRepoRoot $naotoSource.Path))
    $naotoDestination = [System.Drawing.RectangleF]::new($naotoSource.X,120,550,550)
    $naotoGraphics.DrawImage($naotoImage,$naotoDestination,$naotoSource.Crop,[System.Drawing.GraphicsUnit]::Pixel)
    $naotoImage.Dispose()
}
$naotoGraphics.DrawString('顔と髪の識別性を確認するための切り出し比較',$naotoNoteFont,$naotoInk,50,710)
$naotoGraphics.DrawString('比較用の拡大率。本編の身長・表示倍率を示すものではありません。',$naotoNoteFont,$naotoInk,50,748)
$naotoCanvas.Save((Join-Path $PSScriptRoot 'segawa-naoto-face-comparison-02.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$naotoGraphics.Dispose()
$naotoCanvas.Dispose()
$naotoTitleFont.Dispose()
$naotoNoteFont.Dispose()
$naotoInk.Dispose()
