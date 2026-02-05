import os
import shutil

# Mapping logic
suits = {
    'cu': 'cups',
    'pe': 'pentacles',
    'sw': 'swords',
    'wa': 'wands'
}

values = {
    'ac': 'ace',
    '02': 'two',
    '03': 'three',
    '04': 'four',
    '05': 'five',
    '06': 'six',
    '07': 'seven',
    '08': 'eight',
    '09': 'nine',
    '10': 'ten',
    'pa': 'page',
    'kn': 'knight',
    'qu': 'queen',
    'ki': 'king'
}

major_arcana = {
    'ar00': 'the_fool',
    'ar01': 'the_magician',
    'ar02': 'the_high_priestess',
    'ar03': 'the_empress',
    'ar04': 'the_emperor',
    'ar05': 'the_hierophant',
    'ar06': 'the_lovers',
    'ar07': 'the_chariot',
    'ar08': 'strength',
    'ar09': 'the_hermit',
    'ar10': 'wheel_of_fortune',
    'ar11': 'justice',
    'ar12': 'the_hanged_man',
    'ar13': 'death',
    'ar14': 'temperance',
    'ar15': 'the_devil',
    'ar16': 'the_tower',
    'ar17': 'the_star',
    'ar18': 'the_moon',
    'ar19': 'the_sun',
    'ar20': 'judgement',
    'ar21': 'the_world'
}

source_dir = r"d:\taigame\tarot -\TarotApi\raw_cards"
dest_dir = r"d:\taigame\tarot -\TarotWeb\public\assets\cards"

def get_new_name(filename):
    name_part = os.path.splitext(filename)[0]
    
    # Handle Major Arcana
    if name_part in major_arcana:
        return major_arcana[name_part] + ".jpg"
        
    # Handle Minor Arcana
    suit_code = name_part[:2]
    value_code = name_part[2:]
    
    if suit_code in suits and value_code in values:
        return f"{values[value_code]}_of_{suits[suit_code]}.jpg"
        
    return None

def main():
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    files = os.listdir(source_dir)
    count = 0
    
    print(f"Processing {len(files)} files...")
    
    for filename in files:
        if not filename.endswith('.jpg'):
            continue
            
        new_name = get_new_name(filename)
        
        if new_name:
            src_path = os.path.join(source_dir, filename)
            dest_path = os.path.join(dest_dir, new_name)
            
            shutil.copy2(src_path, dest_path)
            print(f"Copied & Renamed: {filename} -> {new_name}")
            count += 1
        else:
            print(f"Skipping unknown file: {filename}")
            
    print(f"Create {count} files in {dest_dir}")

if __name__ == "__main__":
    main()
