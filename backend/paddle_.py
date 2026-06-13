from paddleocr import PaddleOCR
from pprint import pprint
def analysis_image(path: str):
    ocr = PaddleOCR(lang="en")
    result = ocr.ocr(path)
    texts = result[0]['rec_texts']
    clean_text = "\n".join(texts)
    print(clean_text)
    return clean_text
