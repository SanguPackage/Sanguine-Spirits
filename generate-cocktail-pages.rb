#!/usr/bin/env ruby

require 'yaml'

# Function to slugify cocktail names for filenames
def slugify(text)
  text.downcase.strip.gsub(/[^\w\s-]/, '').gsub(/[-\s]+/, '-')
end

# Determine data file format and load cocktails
data_file = nil
cocktails = nil

if File.exist?('_data/cocktails.yml')
  data_file = '_data/cocktails.yml'
  cocktails = YAML.load_file(data_file)
else
  puts "Error: Could not find cocktails data file _data/cocktails.yml"
  exit 1
end

puts "Found cocktails data in: #{data_file}"
puts "Number of cocktails: #{cocktails.length}"

# Generate HTML files for each cocktail
cocktails.each do |cocktail|
  cocktail_name = cocktail['name']

  if cocktail_name.nil? || cocktail_name.empty?
    puts "Warning: Skipping cocktail with missing name: #{cocktail.inspect}"
    next
  end

  # Generate filename
  filename = "#{slugify(cocktail_name)}.html"
  filepath = File.join('cocktails', filename)

  # Generate file content
  content = <<~HTML
    ---
    layout: cocktail
    title: "#{cocktail_name}"
    ---
  HTML

  # Write file
  if File.exist?(filepath)
    puts "Skipped (already exists): #{filepath}"
  else
    File.write(filepath, content)
    puts "Generated: #{filepath}"
  end
end

puts "\nDone! Generated #{cocktails.length} cocktail pages in the /cocktails directory."
puts "Don't forget to commit these files to your repository."
