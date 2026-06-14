from paddleocr import PaddleOCR
def analysis_image(path: str):
    ocr = PaddleOCR(lang="en")
    result = ocr.ocr(path)
    texts = result[0]['rec_texts']
    clean_text = "\n".join(texts)
    print(clean_text)
    return clean_text
