export type CalibrationGrid = "digital" | "daylight" | "blacklight";

export const CALIBRATION_COLUMN_COUNT = 37;
export const CALIBRATION_ROW_COUNT = 20;
export const CALIBRATION_NEUTRAL_COUNT = 33;

export const BLACKLIGHT_CALIBRATION_METADATA = {
  source:
    "https://www.glowtronics-store.com/wp-content/uploads/2021/10/BLACKLIGHT-Color-hart-Guide.pdf",
  sourceKind: "photographic visual reference, not spectral measurement",
  renderSize: [2414, 4574] as const,
  patchRadius: 7,
  hueStartDegrees: 240,
  hueStepDegrees: -10,
  saturationRows: "A-J: 10% through 100%",
  valueRows: "K-T: 100% through 10%",
  neutralDirection: "left-to-right: white through black",
} as const;

const GRID_DATA: Record<CalibrationGrid, string> = {
  digital: [
  "5Or25PL94O773/D41urx3O304/H24fD14fDx6PT05/Ls4O7h5PDj5fDf7vTc9/nk/vvc/fvi/fvk/frd/fja+/Pe+/Lm+vDo+Ons",
  "9eXv9eXv+Ojy+Ov09+fx+Ov0+e729+z1+e72+u/28eXv5+Xz1+Dy1+r52+v62O331urx0Ojv2+7y2ezt2ezq3+/t4O7l2erY2+vY",
  "3+zZ5u/S8PXb+fnV/vvc/vrc//zb+/HU+enV+evd9d/a8tjf8NTg8tvp9eDr9ubw9N7r9+fx9+fx8OXw8ubw8ubw69/s4eDw1tjt",
  "wtjwz+D0y+f7weLuvuDqz+jszebly+Te0ufg0OfXyuHJzuTJ0eTI3urF6O/O8vTI9fXO/frS/fXP+enH9t/I9t/R8NPP7svS79Dh",
  "79Di8NLk8dbm8NHj8tno8dzq5tnq5tnr5tnq4NPm1tLowsPirMTnvdfyut/4sNrrrtnnxeLoutzdt9rUvt3SvNvItde2udexvtqw",
  "0uOx3um46++19PO7+/e/+eq29+K189a38dC/7MG857a/6LzU6bvU6sDX68PZ6sDY7Mjc58vf2sXe2cbf1sbgz8Dcwr/dp6nSlLDc",
  "pcfro9X3nNHnms/fttzkotLWoM/GpNC/o8+3nsudoMqUp82SwtmV1OKd5eqb8O+h+vSm+emg9dqf8Mme7MCn5q2i4Zul4aLE4aHE",
  "4qXH46rK46rK4rDO2rfTyKvPxa3RwK3Rt6fPp6XQhIa+eZbMjbjjhsrzhsjkh8jcpdPdi8fLh8O5iMOticKihb6FhrxwjsBvsdB1",
  "xtl/3eN+7euF+PGK+OmC89GD67uF5quM4JWH2oCK2oaz2oaz2om13I+53ZO715e/y57FtZC/rZLBp4+/nIu/g4a9ZWmtYoC/daba",
  "bsLxcsHhdsHXlM3YdL7EbrqucLmdcLiRbLNnbLJTdrVSocdSutJa1d5d5+dl9e5r+edp8chq56xr4Zlv2oBr1Wdt1Gyi1Wyi1XCn",
  "13es2H2uzoKyvom5oHewmHixjnOwg3CvZmmtVl6nVHO2XpTQaLjuarzgarzTh8fVaLjAZrOjZLGNY7CBYqxVYatVYq5UksBOsM1J",
  "zNpD5ORB8+tK+OVO7sBS5KBS3YhX1mxU0VBW0FOS0VOS0Vic02Gg0Wukx3GpsXWtj2KkhWClemClcF+mWF+nTFikTGuxUIfGYq3n",
  "abrgabnUe8LRZbO7ZK+aYayBYatyXqdWXaZWYKlXg7tRpshLxtZE4eI99Os4+OQ367Y94ZVB2nlF01xDzz9FzkKHzkKGz0eV0E+Z",
  "zluev2Wipmalhlege1mgb1ihZlmhTVmjRlahSmivS37AXaTgabjhaLjRcb7OZLG4YqyVYKp5YKhlXaRWXaRWXqdWeLZSncRNwdRG",
  "4OI+8eo3+OM36rAy34s012430U82zjg5zTV8zTV8zj2Sz0aVzVWbvV6fn1yggVSddVWgalWfX1ahSVaiRFaiRV+pR3S4VZbVZrPp",
  "ZrTXZLLJY6+zYKuNX6doXaRWXKRYXaRYXaRWaLJTlMBPuNBI3OE+8eo39doz6Ksx3IIw018xz0IzzTEyzS9FzixszjaLzT2Rz0+Z",
  "vVqfmVOcelKda1SdX1SgVlWhRFWiQlKfRFynQ3C0UY7PZLDrZrLTZLHIY6+vYKqJX6doXqZaXaRYXaRYXKRYZbBVi71QrsxK1N5B",
  "+us48cgy45ww2Xcu1Fcrzz0szS8wzS07zCZrzCuDzDaQu1CYtFWbkk+adU+cZ0+bYFSgVlWgQlKfP0ybQFaiPGauSH/EWZ3aYq7U",
  "Y6/GYqyrX6mGXqVoXaVbXaVXXaRYXaVYYq5UhrtQqclLythD8tAx67Ix3Yku0mot0EkqzSspzCIpzCU4xhpkyxZ4yx2Luj+SrEuX",
  "i0qZckmXYUiYX1SgVlWgP0ybNT+WOk+dNVynP2+3TIfDWJvHYazEYKmmX6eCXaRoXaVcXaRYXKRYXaRYYqxVfrhRmsNPu8hF7rsx",
  "4JYwz3Mvx14uvz4rvCQpxiMquCQ2uiBftx9svxN/rTGOoUOUhUKTbECVW0GVXFGdT1GeNT+WMzqSMEWXLlKgNl6pQHKtSoKzVJW0",
  "VZeWXqZ+XaVmXaVbXaRXXaRYXaRXWqBTdbFSia5No7BG5Z8w2osvw2Qwt1EutDcttCUssSYrsSoxqSRXpiRgpyJwnCOLmzmQejWO",
  "YDGNUzWPUkaYSEaZMzqRMDWMMTqEMEiIL0yRM1uRPWudQXOZSX+IUI1vWJxfVZZSU5JTW6JWVZZSUY9Oa5xNdZRIjZZDyHswuGwy",
  "qlgwlEMqlCsonCUppiUqnyYrmCNPmiRajiVghyl/jyaLai6IVi+BUDKMQTKNPDaOMDWMLzJ+LjJyLT1zMESBLUh5LlOBMFR+OWd3",
  "QnZgSYJURnxKQ3hFSoRKR31JQ3VCW4NEXnY9d3I3mFMsjEwphj0ndzEifyQkhCEkjiQohyImgSBBgiBOdyFScylveit8VCpsRilq",
  "RS99My96MDB5MDJ/Li1xJyheJy9eKjRoKTVlLD5wKj1oK01pM1hQO2lDOGNANV03PGk+Nl86OmA3R2s7TFswTkwmZjsgbTQgZScc",
  "ZSYcbh4dbRsdbxsdcR0fbRo4dB1DZhpEXiVfYCZhQyJbNh1UPCpuJiNcJyNeLS5xJCZZGxxKHB9IHh9PIyNUJytbJSpZIDBQIz0/",
  "KUg2K0w3K00tK0orKkssNEwqPE0pOkQiOTMdRiUUSRsTTBoTRRkWSxgVSRcWShYWSRgbRxclUw4vVhM3TRhISBlINRlKMRlLLR5V",
  "Ix5TIB1PJSZZFhhAFhg+FRo6Fhc4FhhBHBxNISJSGyVIHDA5ITgwIToxITkjHzEgIjciKTcgKTIfKi4cLykbMxoWMhgZMhgZMRgZ",
  "MhgZMhgYMhgZMhgZMxgeMxgjNRcnNBYyNhU1MhNAKBM5JBU1HRY4Fhg+FhhA",
  ].join(""),
  daylight: [
  "4OTs4unw4+rx5ezz4u3z5e7z5u3z6vH06/L16+/z5e7w5e/u6PHv5/Dt7PPs7vPw7vHr7fHu8fPw8/Xv8/Xv8PHs6uzr4+Pn3t7l",
  "3dvl4uLr4OLr09bh2dnk2trk2Nri1NTez87X1NTcycfRt7zL2+Lu4Ony4+vz4+305O704u3z5u/06PL06vP16vL16fLy6PPt6PLu",
  "6fPt7PTr8PXv7/Ps7/Ls8fTu9Pbw8/Tt8vLt7+/u5uXm4dzk4dzm4+Hr4uDr2tnk29nn3Nvl3Nvk1NPe0dDZ0M7YzMvXvsTV4OXx",
  "1uX04Or03+z13Oz03e716PH26PP06fX16vT06fTw5fXr6PXs6vXs7Pbn8Pjt8vjr8PXq8/Xs9fbu9PTo9fPq8/Lu7+rq5Nrj5N7q",
  "493r4t7s3dro3Nfm29fl3Nnm1NPh0M7czcvYysnaxMfa197xyt7z1eb02Or20+r12O315PL14PL14PPy4vTy5PXu4vbm4vbj5fbj",
  "7Pni8Pnl9frk9fnm9Pjo9vjk9/bh+PTl9/Lt9Ozq7Nzk59ns5Nfr4tbq4Nfp2cvh3tLl3NTl08/jzMneyMXawsLatrzYwdDystLz",
  "x+H1zeb2zOn1zer13vD21vH01PLv1/Pt2fXn2/bb1/XO3ffQ6PnQ7/rX9fvY9vvb9fva+fra+/bW+vLY+vHk+Onh89bb6s7s5svp",
  "5cvq483p38bl3srl2s3myMLjxL/gurjbtLfcqLXcjKzujb/zuNr2wOL3wub2w+jz1u/0xuzwxO7pxe/hyPDbw/C7wPCWxfGZ4Piu",
  "6/q98/y/+PzI+PvL+/rI/PTC++3E++nR+uDO9crL67zp6Lfo5bbn5Lrn4rnm3L3m0L/kubDks67ipKPck5jYcZDVT4XtX6XynM/3",
  "t9/4uOP1uuX0z+z0t+jtr+jesurSsOnCpeVzpeNWreZY2PRn5/h58vqH+Puh+fus+/ip/O6m+uSh+dus98ql862h7Kfi6qHg5qDh",
  "5qfk5q3l2qzlx6zkopLek4vcfoLYbX3WNGvMFW7mL43vdbz1rtr6suH2sOHzyev1quPro+TUoeW6nuOnltxZldxamdxYzvFi5Pdo",
  "8vlw+fmC+/mN+/aM/Oh8+tpu98p29K9q74Vv6YHT6H3T5YPY5ZDc5Zrh2Z7ku5rkiXjdbGrVVGfSQ2TPEmLNAWDZD4DqT6nym9D5",
  "sd/3ruD0w+nzpuHpnOPNmuGplt6Lldxgk9peldtewu5h3vVn7/lz+Pl9+vmI/PaF++Vw+dVi9r9Z8ppR73pa6GrI52TI427S4nTT",
  "44jb1I/hs4njembZXmPUQ17PK1rKBFvKBGnfFoDpQJ/yjsn4st/3sOH0vOfzpuHom+LGmeCdld1yk9pjlNtjmN1kuuxq2/Vr7vl1",
  "+PmB+fiG/PWE+uRs+dFh9bZV8ZFP731T51/B5lvB4mbQ4WrQ4n3W0obfp3XdbWDWU1/TNlrOF1fIAVnHPoXuJoLtM5Xxdb33rdn6",
  "rN72p9/zoODkl+C7k9x4ltxfl9xkltxml9xmq+Zp0vJp7fl29/mA+viK/POA+uJp+c5j86pW8YpS8YJU73lw6Fy04lzK4mPO43jT",
  "0n3cm2TYXFvUOFvSCVLGAk/AAVTBMH7tJoHuK4/xa7f3rNn7rN72qODzpOHineO5md99m99omN1nl9xomNxoquZnzPFp6fl69Pl9",
  "+/iO++t1+91p+MZf859U8o9U8YVW8Htk6WG35VzI4mLN1nLcyXHblmLaWVvVMlfQDlXKA1LDAVG+GXHqGHrsHYbwVqj2j8r5p9v3",
  "p9/ypOLhn+O4mN99md5qmd5qmt5ql9xnp+RnyvFs4vdx8fhz/O9++uRt+tRn9bRV8Y9O8o9b8oZX8YBq6WK55mDF4V3N1WTXwWrd",
  "jWDZWl3WNVfSG1nMBlfHAU28AVfYAWDXAWTSAXTVDo/TVqvWfcPZhMzIldqpl9t4m99vmt5omd1pmNxppeNpx/By3fZ27PRt/Ol6",
  "+tpq9sFX8aFO6XZC7XhT8YJY6XVu4ly53FbF21nPxFzWt2Xcg1rWVFzXNlrUKmHSAU28AVPHAUnJAVLIAVXEAFzEAWm+AoO8L5e2",
  "QJOTYKdtZKJCZJ40a6Y5dLFBfbtLi8xcuuptz+1t4uxh++Fy+tZq8atM6oVB32Q95m1P5nNc5G9g11mzzFO9vkzFnEXFn0zKcFPM",
  "QlbSLVXPH13TAUe1BlvMAUXEAUrDAVK6AVG+AVarAWyzAXutKIGKRIxhWJU9T4cwUow3ZZs0WZI6VIw6cJ45hKIznKYpyqAs0Z0y",
  "zHsrtVczpk1CsVBJvlhKsU9HnTiCmDeSjDiedTawczKuMjCbGTmqAz+xAUOzAUSvAU+7ATSmAUS0AVSyAVe/AU2dAVShAWKlG3CG",
  "O3phQ4FDPHA6Q3tCS4ZAR4FBQHZAXYg4YoQ6dHgwnGEmk1cvg0AqazkvfERDgEREmUpIjEdIgUNygUKDc0CLYzqoXzOmFiNzAymA",
  "ADSaATWXATaQATucAS+SATSICUubA1S0AUaZAUSYAlSgB16PNV9dOmxGNGE/PGdHPG9GO2lGOWVBSXZBU25ETFk9ak09bUE2SCsn",
  "UDMxaEJDYz5AZD1AYz5CXT1caT9wWDxxUD2cRTKMBh1aBR5XASyFASdjASNcASpvAi52BSJQIjtuG0SRBj6OATiGBEOTJE1/JUBO",
  "OVhQMlFEOVpFM1RBOltFL0s2QVtCQlRCLjYvPjU1MygtOy4yODI5PzU9NS42MCgwMSw0MS08NypDPDBUNzJ1LCttBBpLBRxPASJe",
  "AR1OARU2ARxDHSpIChUoFyE2JDFNKDdgGTl2Ay1pHDZhFyg3N0tRLD9DGyknKTU1KDYzISwoICkoJCsrIiYoISImIyMqMDI7JCQs",
  "IiIqHh8mGhshGxwiHyEuGhwpHyEwIidHKi5VExxDDRk3Dxo0DhkyDxcpBw8f",
  ].join(""),
  blacklight: [
  "Sln8TV7+UmP+Vmn9VW3+WHH9W3H9YXr+X33+YHr+Wn/+VpL8W5T8XZ38ZKv8Q5P8PZz7EYj6MJv6R635WbP6WKP7RYP8TXb9YHz+",
  "Z4H+aon9aIP+ZoD+aIT+ZoL+ZYH+aX7+Z37+aHz+Z3b+Tl38Sln8U2P+WGj9XW/+XHT+XHX+Y3r9YoL+X4X+YYT+YpD9ZqX8aar9",
  "aK/9bb38Vq77Sq/7N6b6TrT7Vbn7bsD6c7b7YJj7ZI38ZH7+coj+do7+cYr+bIf+cIf+bYr+bYf+bYL+boL+boD+b3n+X2j+VWD9",
  "VGH+W2v+YHD+X3f+X3v9Z4X+YYr+Z5j9bJ/9b6v9cb38dsD8d8X8e837acX7ds36ZMP6bcj6eMr6ktL6lMn7g7X8hKX8c4n9don9",
  "fI7+d4n+c4f+dYb+dIn+c4f+c4P+c4L+dIH+dX7+bHP+Vlz+VGH+XWr+YHD9WnT+XXz9Zoj+YZL9YqD9bKz9dL39dsz5eNL4d9X4",
  "fd74e9z5o+r5l+T6m+j5q+j5rOL5rtn6k776o7b8kpf9gYj+hIj+gIf+foX+f4T+fYf+e4f+eoP+eYL+eYH+d3v+aGz+TVH8S1f9",
  "Wmj+X3D+XXf+WHz+aIn+Voz+VaL9XrP8Z8D7Z9PwZtvqZ97rUOrrb/DycfTvTe7wTObzb+XxjuTvtdj1s875v8P6tJ38i3z+kID+",
  "j4L+jIP+jIL+iYT+g4X+f3//fX3+enn+eHb+Y2T+Nzb0OUX6U2D+W2v+VXP+T3b+YIf+PIf8Kp74Ma70O7rxPs/YONG5L9W5VPDC",
  "dP3QYfrHd/XaiOrto+7mvu/S0t7d29fs6cry76f8nXX/nnf+nnv+m3z+mX3+k3/+hn3/eXD+dm//bmb+ZWD+Skn9ICDnJjHxQlH9",
  "VWb+S23+RHH9WoX+C3z7AZbxAaboAbDdDKqVDKN2A6l1UeV9hvqPgP9rnfilsPLIwu/H3e+w8dax9NTU/sjf/6bhu4D+rmP+qWv+",
  "pnH+onP+k3D+hXL/bFj+Zlb/Wk3+TkT9MiryARHdESPpLD73Tl3+RGX9PGn8VX7+AXL5AY3oAZ7TAaPEAY94AYZzAYdtL9N3fPN8",
  "p/6Ap/5xtveIyPOX+vFs/tl7/b6V/rSs/mOl2Gf+yST8ukP9slf9qmf+mGj+gGL+YUX9Ujz9RDT6PC33Kh/uAQHSAR3iITTyQ1L9",
  "RWL9NmX8Q3b9AW/2AIrfAZfDAZWnAId5AYFyAIBvFcB2YOp3o/6Ivv6axPqb0/ig/vF//s9I/qQ//ote/lKB5Bv+2AH1xBL7vy78",
  "skr+mVv/fFf+Vzf8SjP6PSv2Nib1HxjpAADQAhvhGSzsOkn7R2H9M2P8LGz8AWnyAYjXAZCyAYqMAIV8AX95AH5zAa56S+FymPuF",
  "u/6VwPuW0PmY/u1t/b8i/6Am/35E/nN86gD54ADwxwD4xAb5tzv9mk7+d0f9UjP6RS/5Oij2MiLzGhLnAADRARTcCCPmKzz4TVr+",
  "PWD9JV/6AGruAYjLAIOJAX9zAX92AX97AX51AZl6Ndd3jPiBtv+Srfp00Pp3/uZp/rcq/5Az/nNO/29r9QCB6gHhzwD3yQH4wDL9",
  "nk3+cjr8SzH6PCr4MSLzKhzvDg/kAADSARDbBCDkKjn2UF3+P2L8LWP7AW3tAYrIAYWMAX92AYF6AYJ9AX92AJd2LdF8g/WIsf+N",
  "wvqN5/pd/tpk/68L/ow4/4BR/WZT9wBj7ADm2AD1ywH4p0D8mEX9bzv9STD6Oyf3NSX2LB3xCAbgAADPAQfYARjfIS/wPkv8Q2D9",
  "JWL6AW/rAYjKAYWOAX53AYJ7AYN6AX52AZV4LcyAcvCEp/6J3/tm/vFW/s1A/pgi/n8//4Rj+l1K9gFs6gHp4AD2zQH4qiz7kT/9",
  "aTf7Ryr5OSH1Nib2Lx7zAgDdAADCAADSAQ3YDSHnKDr2Lk75KGH6AW7qAYnDAYKLAYJ7AYN6AIZ7AYR8AZN6KcJ/VuJ+l/aI9fdi",
  "/tRI/qc8/3w1/lFP/lZr90JX7gGB3wDrzADyvwD4mir7iDz8YC77QyX3Nhv0OSb4IQztAADYAQC9AQDFAALRARHZCyfnGDrvBE7y",
  "AFfeAYu9AIKJAYF7AIZ+AYiBAYiBAX14IrOBP8KCctl4/txq/tVr/olC/FBA/DtT+QFW6wBj6QBsyQDkswDsoQj2gST3gCz6UiD2",
  "OBjyLwzuMxryAADpAADYAAC6AAC6AQC+AQDFARbNACfeATDeAT3MAV6lAW98AGVvAGJwAYB5AHB7AWNyBoiAKYpxVKt0+K9W745V",
  "71pOwQBIygB11AGA3wB41gF5sADaoQDphQXsaiL3bSL3PxfwMAvuLgntHwHnAQDiAQDXAACuAACpAACpAAC2AACsAQ69ARa+ASe0",
  "ATaMAUFlATxdAT1dAVBtAUVhATxiAV9vAU9fOVxitT1RkRVShQFNXgFSfAF7hAB4rwCHkwCBgwHFfgHZYwXbVxfuWhvyKQHiHQDg",
  "JQHnAADaAADUAADUAACeAACEAQCGAACUAACZAACrAQCkAAWbARJtASNOACBOAR9LAS1ZASNOASVRATldAShMARlBMQpHQAFCMgFB",
  "NQBSSQBkSABkTgBnTgFuTgCzYgHMRAPJQA/lQAfiBQHRAQDGAgDgAACsAACuAQDGAAByAABWAABWAABjAAB6AQCIAgCNAABuAgBP",
  "AQI+AQdFARA+AQtAARBBARFDABZFAQo3AAAvAAA2AAE3AgA6AAA+AQBBAQFFAABGAQFLAQFlCwGMFwGqHADLDQDJAAC2AAC6AQC7",
  "AACaAAB9AACUAAA4AAAyAAAxAAAyAQFLAQBoAAB8AAFdAQBCAAA2AABAAAEuAQAnAAAuAAAvAQAqAAAmAQAnAQAtAAAyAAAyAQAs",
  "AAAyAAA0AAA0AAAyAQBBAQFIAABWAQB9AACaAQCoAQCRAAB0AAFdAQBMAQBJ",
  ].join(""),
};

const NEUTRAL_DATA: Record<CalibrationGrid, string> = {
  digital: [
  "6+vr5eXl39/f2NjY0tLSysrKwsLCu7u7s7Ozq6uroqKimZmZkZGRiYmJgYGBeXl5cHBwZ2dnX19fVlZWTk5OR0dHPj4+Nzc3Ly8v",
  "KCgoISEhHR0dFxcXERERDAwMBwcHAAAA",
  ].join(""),
  daylight: [
  "g4WKgoWGbXF0dXp8dnt9d4CAYmttYmxrZG5vXmhoUFtbUV5dVGBgUF9cSlxcUWFfWW5uOEhKLz5CISwuICwxFBwfFh8kFh0iERcb",
  "FBgdFRgdExUaDA0SCwwRBwgNEBAVDA0S",
  ].join(""),
  blacklight: [
  "QFr4PWT7Smz7TnL9THL8Tnf7V4D8VYH7V4T5VIH5R3z2NnPxJ2ruB2LnAVjfAU7ZATjEASedAR6TARuVARSHAQZpAAFaAQFHAAE2",
  "AQAsAAAjAAAiAAAaAAAXAAAWAAAWAAAW",
  ].join(""),
};

const decode = (encoded: string) => {
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const grids = new Map<CalibrationGrid, Uint8Array>();
const neutralRamps = new Map<CalibrationGrid, Uint8Array>();

export const getCalibrationGrid = (grid: CalibrationGrid) => {
  const cached = grids.get(grid);
  if (cached) return cached;

  const decoded = decode(GRID_DATA[grid]);
  grids.set(grid, decoded);
  return decoded;
};

export const getCalibrationNeutralRamp = (grid: CalibrationGrid) => {
  const cached = neutralRamps.get(grid);
  if (cached) return cached;

  const decoded = decode(NEUTRAL_DATA[grid]);
  neutralRamps.set(grid, decoded);
  return decoded;
};

